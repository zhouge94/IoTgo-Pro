/**
 * Dependencies
 */
const express = require('express');
const expressJwt = require('express-jwt');
const jsonWebToken = require('jsonwebtoken');
const config = require('../config');
const db = require('../db/index');
const User = db.User;
const Device = db.Device;
const DeviceStatus = db.DeviceStatus;
const FactoryDevice = db.FactoryDevice;
const https = require('https');

/**
 * Private variables
 */
const recaptchaSecret = config.recaptcha.secret;
const recaptchaUrl = config.recaptcha.url;

/**
 * Exports
 */
module.exports = exports = express.Router();

// Enable Json Web Token
exports.use(expressJwt(config.jwt).unless({
  path: ['/api/user/register', '/api/user/login']
}));

// Registration
exports.route('/register').post(function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  if (! email || ! password) {
    res.send({
      error: 'Email address and password must not be empty!'
    });
    return;
  }

  User.register(email, password, function (err, user) {
    if (err) {
      res.send({
        error: 'Email address already exists, please choose another one.'
      });
      return;
    }

    res.send({
      jwt: jsonWebToken.sign(user, config.jwt.secret),
      user: user
    });
  });

  // Google reCAPTCHA verification
  /*
  const response = req.body.response;
  if (! response) {
    res.send({
      error: 'reCAPTCHA verification is required!'
    });
  }

  const url = recaptchaUrl +
    '?secret=' + recaptchaSecret +
    '&response=' + response;

  https.get(url, function (recaptchaRes) {
    recaptchaRes.setEncoding('utf8');

    const data = '';
    recaptchaRes.on('data', function (chunk) {
      data += chunk;
    });
    recaptchaRes.on('end', function () {
      try {
        data = JSON.parse(data);
        if (! data.success) {
          res.send({
            error: 'reCAPTCHA verification failed!'
          });
          return;
        }

        User.register(email, password, function (err, user) {
          if (err) {
            res.send({
              error: 'Email address already exists, please choose another one.'
            });
            return;
          }

          res.send({
            jwt: jsonWebToken.sign(user, config.jwt.secret),
            user: user
          });
        });
      }
      catch (err) {
        res.send({
          error: 'reCAPTCHA verification failed! Please try again later.'
        });
      }
    });
  }).on('error', function () {
    res.send({
      error: 'reCAPTCHA verification failed! Please try again later.'
    });
  });
  */

});

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

  User.authenticate(email, password, function (err, user) {
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

// Password management
exports.route('/password').post(function (req, res) {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  if (typeof oldPassword !== 'string' || ! oldPassword.trim() ||
    typeof newPassword !== 'string' || ! newPassword.trim()) {
    res.send({
      error: 'Old password and new password must not be empty!'
    });
    return;
  }

  User.authenticate(req.user.email, oldPassword, function (err, user) {
    if (err) {
      res.send({
        error: 'Change password failed!'
      });
      return;
    }

    if (! user) {
      res.send({
        error: 'Old password is not correct!'
      });
      return;
    }

    User.setPassword(req.user.email, newPassword, function (err) {
      if (err) {
        res.send({
          error: 'Change password failed!'
        });
        return;
      }

      res.send({});
    });
  });
});

// Device management
exports.route('/device').get(function (req, res) {
  Device.getDevicesByApikey(req.user.apikey, function (err, devices) {
    if (err || ! devices.length) {
      res.send([]);
      return;
    }

    res.send(devices);
  });
}).post(function (req, res) {
  if (! req.body.name || ! req.body.type) {
    res.send({
      error: 'Device name and type must be specified!'
    });
    return;
  }

  Device.getNextDeviceid(req.body.type, function (err, deviceid) {
    if (err) {
      res.send({
        error: err
      });
      return;
    }

    const device = {
      name: req.body.name,
      group: req.body.group,
      type: req.body.type,
      deviceid: deviceid,
      apikey: req.user.apikey
    };

    (new Device(device)).save(function (err, device) {
      if (err) {
        res.send({
          error: 'Create device failed!'
        });
        return;
      }

      res.send(device);
    });
  });
});

exports.route('/device/add').post(function (req, res) {
  const name = req.body.name;
  const apikey = req.body.apikey;
  const deviceid = req.body.deviceid;
  if ('string' !== typeof name || ! name.trim() ||
    'string' !== typeof apikey || ! apikey.trim() ||
    'string' !== typeof deviceid || ! deviceid.trim()) {
    res.send({
      error: 'Device name, id and apikey must not be empty!'
    });
    return;
  }

  if (! /^[0-9a-f]{10}$/.test(deviceid)) {
    res.send({
      error: 'Invalid device id format!'
    });
    return;
  }

  FactoryDevice.exists(apikey, deviceid, function (err, device) {
    if (err) {
      res.send({
        error: 'Add device failed!'
      });
      return;
    }

    if (! device) {
      res.send({
        error: 'Device does not exist!'
      });
      return;
    }

    Device.where('deviceid', deviceid).findOne(function (err, device) {
      if (err) {
        res.send({
          error: 'Add device failed!'
        });
        return;
      }

      if (device) {
        res.send({
          error: (device.apikey === req.user.apikey) ?
            'Device has already been added!' : 'Device belongs to other user!'
        });
        return;
      }

      device = new Device({
        name: name,
        group: req.body.group ? req.body.group : '',
        type: deviceid.substr(0, 2),
        deviceid: deviceid,
        apikey: req.user.apikey
      });
      device.save(function (err, device) {
        if (err) {
          res.send({
            error: 'Add device failed!'
          });
          return;
        }

        res.send(device);
      });
    });
  });
});

exports.route('/device/:deviceid').get(function (req, res) {
  Device.exists(req.user.apikey, req.params.deviceid, function (err, device) {
    if (err || ! device) {
      res.send({
        error: 'Device does not exist!'
      });
      return;
    }

    res.send(device);
  });
}).post(function (req, res) {
  if (typeof req.body.name !== 'string' ||
      typeof req.body.group !== 'string') {
    res.send({
      error: 'Device name and group must not be empty!'
    });
    return;
  }

  Device.exists(req.user.apikey, req.params.deviceid, function (err, device) {
    if (err || ! device) {
      res.send({
        error: 'Device does not exist!'
      });
      return;
    }

    device.name = req.body.name;
    device.group = req.body.group;
    device.save(function (err, device) {
      if (err) {
        res.send({
          error: 'Save device failed!'
        });
        return;
      }

      res.send(device);
    });
  });
}).delete(function (req, res) {
  Device.exists(req.user.apikey, req.params.deviceid, function (err, device) {
    if (err || ! device) {
      res.send({
        error: 'Device does not exist!'
      });
      return;
    }

    device.remove(function (err, device) {
      if (err) {
        res.send({
          error: 'Delete device failed!'
        });
      }

      res.send(device);
    });
  });
});

exports.route('/device/:deviceid/records').get(function (req, res) {
  Device.exists(req.user.apikey, req.params.deviceid, function (err, device) {
    if (err || ! device) {
      res.send({
        error: 'Device does not exist!'
      });
      return;
    }
    
    DeviceStatus.where('deviceid', req.params.deviceid).find(function (err, statuses) {
        if(err) {
            res.send({
                error: 'fetching statuses failed for ' + deviceid
            });
            return;
        }

        res.send(statuses);
    });
  });
});

