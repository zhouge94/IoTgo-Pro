/**
 * Dependencies
 */
const mongoose = require('mongoose');

/**
 * Private variables and functions
 */
const Schema = mongoose.Schema;
const lastDeviceids = {};
const db = require('./index');

const incDeviceid = function (deviceid) {
    // Deviceid should be a string of 10 characters
    // First 2 characters form the type of device
    const type = deviceid.substr(0, 2);
    deviceid = (parseInt(deviceid.substr(2), 16) + 1).toString(16);

    //if (deviceid.length > 8) {
    //  return false;
    //}

    if (deviceid.length < 8) {
        deviceid = '00000000'.substr(deviceid.length) + deviceid;
    }

    // Third party devices take lower half of device id space
    if (deviceid.charAt(0) >= '8') {
        return false;
    }

    return type + deviceid;
};

const now = function () {
    return new Date();
};

const empty = function () {
    return {};
};

/**
 * Exports
 */
const schema = new Schema({
    name: {type: String, required: true},
    group: {type: String, default: ''},
    type: {type: String, required: true, index: true, match: /^[0-9a-f]{2}$/},
    deviceid: {type: String, required: true, index: true, match: /^[0-9a-f]{10}$/},
    apikey: {type: String, required: true, index: true},
    createdAt: {type: Date, index: true, default: now},
    online: {type: Boolean, index: true, default: false},
    params: {type: Schema.Types.Mixed, default: empty},
    loc: {type: [Number], index: '2d', default: [0, 0]}, //"经度,纬度"
    price: {type: String, default: '0'}, //设备价格，单位元/小时
    status: {type: String, default: '0'}, //0:空闲; 1:工作; 2:故障; 3:停用
    isHired: {type: String, default: '0'} //是否出租.0: 出租，主人愿意出租; 1: 不出租，主人不愿意出租
});

schema.static('exists', function (apikey, deviceid, callback) {
    this.where({apikey: apikey, deviceid: deviceid}).findOne(callback);
});

schema.static('getDeviceByDeviceid', function (deviceid, callback) {
    this.where({deviceid: deviceid}).findOne(callback);
});

schema.static('getDevicesByApikey', function (apikey, callback) {
    this.where('apikey', apikey).find(callback);
});

//出租或者未出租的设备
schema.static('getHiredDevices', function (longitude, latitude, callback) {
    // 先对二维数据列建立索引
    // db.devices.ensureIndex({loc: '2d'});
    this.find({"loc": {$near: [longitude, latitude], $maxDistance: 2000}}).exec(callback);//搜索2千米内的车位锁
});

schema.static('getNextDeviceid', function (type, callback) {
    if (!/^[0-9a-f]{2}$/.test(type)) {
        callback('Device type ' + type + ' is forbidden!');
        return;
    }

    if (lastDeviceids[type]) {
        let deviceid = incDeviceid(lastDeviceids[type]);
        if (!deviceid) {
            callback('Not enough device ids available!');
            return;
        }

        lastDeviceids[type] = deviceid;
        callback(null, deviceid);
        return;
    }

    this.where({type: type, deviceid: {$lt: type + '80000000'}})
        .select('deviceid').sort('-deviceid').findOne(function (err, device) {
        if (err) {
            callback(err);
            return;
        }

        let deviceid;
        if (!device) {
            // Starting with 1 instead of 0 makes more sense to non-programmer
            deviceid = type + '00000001';
            lastDeviceids[type] = deviceid;
            callback(null, deviceid);
            return;
        }

        deviceid = incDeviceid(device.deviceid);
        if (!deviceid) {
            callback('Not enough device ids available!');
            return;
        }

        lastDeviceids[type] = deviceid;
        callback(null, deviceid);
    });
});

module.exports = mongoose.model('Device', schema);