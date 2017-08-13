/**
 * Dependencies
 */
var mongoose = require('mongoose');

/**
 * Private variables and functions
 */
var Schema = mongoose.Schema;

var now = function () {
  return new Date();
};

var empty = function () {
  return {};
};

/**
 * Exports
 */
var deviceStatus = new Schema({
  deviceid: { type: String, required: true, index: true, match: /^[0-9a-f]{10}$/ },
  createdAt: { type: Date, index: true, default: now },
  status: { type: Schema.Types.Mixed, default: empty }
});

module.exports = mongoose.model('DeviceStatus', deviceStatus);
