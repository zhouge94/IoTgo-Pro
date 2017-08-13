/**
 * Dependencies
 */
var User = require('./user');
var Device = require('./device');
var DeviceStatus = require('./device_status');
var FactoryDevice = require('./factory_device');
var mongoose = require('mongoose');

/**
 * Exports
 */
module.exports = exports = mongoose;

exports.User = User;
exports.Device = Device;
exports.FactoryDevice = FactoryDevice;
exports.DeviceStatus = DeviceStatus;

