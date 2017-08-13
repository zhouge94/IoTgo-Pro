/**
 * Dependencies
 */
const User = require('./user');
const Device = require('./device');
const DeviceStatus = require('./device_status');
const FactoryDevice = require('./factory_device');
const mongoose = require('mongoose');

/**
 * Exports
 */
module.exports = exports = mongoose;

exports.User = User;
exports.Device = Device;
exports.FactoryDevice = FactoryDevice;
exports.DeviceStatus = DeviceStatus;

