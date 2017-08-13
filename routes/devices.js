/**
 * Dependencies
 */
const express = require('express');
const expressJwt = require('express-jwt');
const config = require('../config');
const db = require('../db/index');
const Device = db.Device;

/**
 * Exports
 */
module.exports = exports = express.Router();

// Enable Json Web Token
exports.use(expressJwt(config.jwt).unless({
    path: ['/api/devices/hire']
}));

// Registration
exports.route('/hire').get(function (req, res) {
    const longitude = req.query.longitude;//经度
    const latitude = req.query.latitude;//纬度
    if (!latitude || !longitude) {
        res.send({
            status: '1',
            error: '参数不全'
        });
    }
    Device.getHiredDevices(longitude, latitude, function (err, devices) {
        if (err || ! devices.length) {
            res.send({
                status: '1',
                error: '附近没有可用的停车位'
            });
            return;
        }
        res.send(devices);
    });
});
