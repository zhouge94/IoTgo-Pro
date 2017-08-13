/**
 * Dependencies
 */
let db = require('../db/index');
let User = db.User;
let Device = db.Device;
let DeviceStatus = db.DeviceStatus;
let FactoryDevice = db.FactoryDevice;
let validate = require('./types');
let interceptors = require('./interceptors');
let EventEmitter = require('events').EventEmitter;
let mixin = require('utils-merge');

/**
 * Exports
 */
module.exports = exports = {};
mixin(exports, EventEmitter.prototype);

exports.register = function (req, callback) {
  FactoryDevice.exists(req.apikey, req.deviceid, function (err, device) {
	if (err || !device) {
	  callback(interceptors(req, {
		error: 403,
		reason: 'Forbidden'
	  }));
	  return;
	}

	Device.getDeviceByDeviceid(req.deviceid, function (err, device) {
	  if (err || !device) {
		callback(interceptors(req, {
		  error: 404,
		  reason: 'Not Found'
		}));
		return;
	  }

	  callback(interceptors(req, {
		error: 0,
		apikey: device.apikey
	  }));
	});
  });
};

exports.update = function (req, callback) {
  //检查请求参数
  // if (typeof req.params !== 'object' || ! validate(req)) {
  //   callback(interceptors(req, {
  //     error: 400,
  //     reason: 'Bad Request'
  //   }));
  //   return;
  // }

  Device.exists(req.apikey, req.deviceid, function (err, device) {
	if (err || !device) {
	  callback(interceptors(req, {
		error: 403,
		reason: 'Forbidden'
	  }));
	  return;
	}

	mixin(device.params, req.params);
	device.markModified('params');
	if (req.params.timers) {
	  device.markModified('params.timers');
	}
	device.save();
	deviceStatus = new DeviceStatus({deviceid: device.deviceid, status: req.params});
	deviceStatus.markModified('status');
	deviceStatus.save();

	callback(interceptors(req, {
	  error: 0
	}));

	exports.emit('update', req);
  });
};

exports.query = function (req, callback) {
  if (!Array.isArray(req.params)) {
	callback(interceptors(req, {
	  error: 400,
	  reason: 'Bad Request'
	}));
	return;
  }

  Device.exists(req.apikey, req.deviceid, function (err, device) {
	if (err || !device) {
	  callback(interceptors(req, {
		error: 403,
		reason: 'Forbidden'
	  }));
	  return;
	}

	if (!req.params.length) {
	  callback(interceptors(req, {
		error: 0,
		params: device.params
	  }));
	  return;
	}

	let params = {};
	req.params.forEach(function (item) {
	  if (item in device.params) {
		params[item] = device.params[item];
	  }
	});
	callback(interceptors(req, {
	  error: 0,
	  params: params
	}));
  });
};
