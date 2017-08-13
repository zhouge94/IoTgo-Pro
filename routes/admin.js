/**
 * Dependencies
 */
const express = require('express');
const expressJwt = require('express-jwt');
const jsonWebToken = require('jsonwebtoken');
const unless = require('express-unless');
const config = require('../config');
const db = require('../db/index');
const User = db.User;
const Device = db.Device;
const FactoryDevice = db.FactoryDevice;

/**
 * Private constiables and functions
 */
const authenticate = function (email, password, callback) {
  if (! email in config.admin || config.admin[email] !== password) {
    callback(null, false);
    return;
  }

  callback(null, { email: email, isAdmin: true });
};

const adminOnly = function (req, res, next) {
  if (! req.user.isAdmin) {
    const err = new Error('Admin only area!');
    err.status = 401;
    next(err);
  }

  next();
};
adminOnly.unless = unless;

/**
 * Exports
 */
module.exports = exports = express.Router();

// Enable Json Web Token
exports.use(expressJwt(config.jwt).unless({
  path: [ '/api/admin/login' ]
}));

// Restrict access to admin only
exports.use(adminOnly.unless({
  path: [ '/api/admin/login' ]
}));

// Login
exports.route('/login').post(function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  if (! email || ! password) {
    res.send({
      error: 'Email address and password must not be empty!'
    });
    return;
  }

  authenticate(email, password, function (err, user) {
    if (err || ! user) {
      res.send({
        error: 'Email address or password is not correct!'
      });
      return;
    }

    res.send({
      jwt: jsonWebToken.sign(user, config.jwt.secret),
      user: user
    });
  });
});

// User management
exports.route('/users').get(function (req, res) {
  const limit = Number(req.query.limit) || config.page.limit;
  const skip = Number(req.query.skip) || 0;

  var condition = {};
  if (req.query.createdAtFrom) {
    condition.createdAt = condition.createdAt ? condition.createdAt : {};
    condition.createdAt.$gte = new Date(req.query.createdAtFrom);
  }
  if (req.query.createdAtTo) {
    condition.createdAt = condition.createdAt ? condition.createdAt : {};
    condition.createdAt.$lte = new Date(req.query.createdAtTo);
  }

  User.find(condition).select('-password').skip(skip).limit(limit)
      .sort({ createdAt: config.page.sort }).exec(function (err, users) {
    if (err) {
      res.send({
        error: 'Get user list failed!'
      });
      return;
    }

    res.send(users);
  });
});

exports.route('/users/:apikey').get(function (req, res) {
  User.findOne({ 'apikey': req.params.apikey}).select('-password')
      .exec(function (err, user) {
    if (err || ! user) {
      res.send({
        error: 'User does not exist!'
      });
      return;
    }

    res.send(user);
  });
}).delete(function (req, res) {
  User.findOneAndRemove({ 'apikey': req.params.apikey }, function (err, user) {
    if (err || ! user) {
      res.send({
        error: 'User does not exist!'
      });
      return;
    }

    // Delete all devices belong to user
    Device.remove({ apikey: req.params.apikey }, function (err) {
      if (err) {
        res.send({
          error: 'Delete user\'s devices failed!'
        });
        return;
      }

      res.send(user);
    });
  });
});

// Device management
exports.route('/devices').get(function (req, res) {
  var limit = Number(req.query.limit) || 0;
  var skip = Number(req.query.skip) || 0;

  const condition = {};
  if (req.query.createdAtFrom) {
    condition.createdAt = condition.createdAt || {};
    condition.createdAt.$gte = new Date(req.query.createdAtFrom);
  }
  if (req.query.createdAtTo) {
    condition.createdAt = condition.createdAt || {};
    condition.createdAt.$lte = new Date(req.query.createdAtTo);
  }
  if (req.query.name) {
    condition.name = new RegExp(req.query.name, 'i');
  }
  if (req.query.type) {
    condition.type = req.query.type;
  }
  if (req.query.deviceid) {
    condition.deviceid = new RegExp(req.query.deviceid, 'i');
  }
  if (req.query.apikey) {
    condition.apikey = req.query.apikey;
  }
  if (req.query.lastModifiedAtFrom) {
    condition.lastModified = condition.lastModified || {};
    condition.lastModified.$gte = new Date(req.query.lastModifiedAtFrom);
  }
  if (req.query.lastModifiedAtTo) {
    condition.lastModified = condition.lastModified || {};
    condition.lastModified.$lte = new Date(req.query.lastModifiedAtTo);
  }

  Device.find(condition).select('-params').skip(skip).limit(limit)
      .sort({ createdAt: config.page.sort }).exec(function (err, devices) {
    if (err) {
      res.send({
        error: 'Get device list failed!'
      });
      return;
    }

    res.send(devices);
  });
});

exports.route('/devices/:deviceid').get(function (req, res) {
  Device.findOne({ 'deviceid': req.params.deviceid })
      .exec(function (err, device) {
    if (err || ! device) {
      res.send({
        error: 'Device does not exist!'
      });
      return;
    }

    res.send(device);
  });
});

// Factory device management
exports.route('/factorydevices').get(function (req, res) {
  const limit = Number(req.query.limit) || 0;
  const skip = Number(req.query.skip) || 0;

  var condition = {};
  if (req.query.createdAtFrom) {
    condition.createdAt = condition.createdAt || {};
    condition.createdAt.$gte = new Date(req.query.createdAtFrom);
  }
  if (req.query.createdAtTo) {
    condition.createdAt = condition.createdAt || {};
    condition.createdAt.$lte = new Date(req.query.createdAtTo);
  }
  if (req.query.name) {
    condition.name = new RegExp(req.query.name, 'i');
  }
  if (req.query.type) {
    condition.type = req.query.type;
  }
  if (req.query.deviceid) {
    condition.deviceid = new RegExp(req.query.deviceid, 'i');
  }
  if (req.query.apikey) {
    condition.apikey = req.query.apikey;
  }

  FactoryDevice.find(condition).skip(skip).limit(limit)
      .sort({ createdAt: config.page.sort })
      .exec(function (err, factoryDevices) {
    if (err) {
      res.send({
        error: 'Get factory device list failed!'
      });
      return;
    }

    res.send(factoryDevices);
  });
});

exports.route('/factorydevices/create').post(function (req, res) {
  const name = req.body.name,
      type = req.body.type,
      qty = Number(req.body.qty),
      createdAt = new Date();

  if (! name || ! name.trim() || ! type || ! /^[0-9a-f]{2}$/.test(type)
      || 'number' !== typeof qty || 0 === qty) {
    res.send({
      error: 'Factory device name, type and qty must not be empty!'
    });
    return;
  }

  FactoryDevice.getNextDeviceid(type, function (err, nextDeviceid) {
    if (err) {
      res.send({
        error: 'Create factory device failed!'
      });
      return;
    }

    let i = 0;
    let devices = [];
    do {
      let factoryDevice = new FactoryDevice({
        name: name,
        type: type,
        deviceid: nextDeviceid,
        createdAt: createdAt
      });
      factoryDevice.save();
      devices.push(factoryDevice);

      nextDeviceid = FactoryDevice.incDeviceid(nextDeviceid);
      i += 1;
    } while (i < qty && nextDeviceid);

    /*
    if (req.query.file) {
      res.attachment(name + '-' + type + '-' + qty + '.csv');

      const download = [[ 'name', 'type', 'deviceid', 'apikey' ]];
      devices.forEach(function (device) {
        download.push([
          device.name, device.type, device.deviceid, device.apikey
        ]);
      });
      download.forEach(function (item, index) {
        download[index] = item.join(', ');
      });

      console.log(download.join('\r\n'));
      res.send(download.join('\r\n'));
      return;
    }
    */

    res.send(devices);
  });
});