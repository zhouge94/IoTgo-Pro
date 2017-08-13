/**
 * Dependencies
 */
const mongoose = require('mongoose');

/**
 * Private letiables and functions
 */
const Schema = mongoose.Schema;

const now = function () {
  return new Date();
};

const empty = function () {
  return {};
};

/**
 * Exports
 */
const deviceStatus = new Schema({
  deviceid: { type: String, required: true, index: true, match: /^[0-9a-f]{10}$/ },
  createdAt: { type: Date, index: true, default: now },
  status: { type: Schema.Types.Mixed, default: empty }
});

module.exports = mongoose.model('DeviceStatus', deviceStatus);
