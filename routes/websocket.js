/**
 * Dependencies
 */
const Server = require('ws').Server;
const protocol = require('../protocol/index');
const mixin = require('utils-merge');

/**
 * Private variables and functions
 */

let devices = {}; // { deviceid: [ws, ws, ws] }
let apps = {};  // { deviceid: [ws, ws, ws] }

const clean = function (ws) {
  ws.devices.forEach(function (deviceid) {
    if (Array.isArray(devices[deviceid]) && devices[deviceid][0] === ws) {
      delete devices[deviceid];
      protocol.postMessage({
        type: 'device.online',
        deviceid: deviceid,
        online: false
      });
    }

    let pos, wsList = apps[deviceid];
    if (wsList && (pos = wsList.indexOf(ws)) !== -1) {
      wsList.splice(pos, 1);
      if (wsList.length === 0) delete apps[deviceid];
    }
  });
};

const Types = {
  'REQUEST': 1,
  'RESPONSE': 2,
  'UNKNOWN': 0
};

const getType = function (msg) {
  if (msg.action && msg.deviceid && msg.apikey) return Types.REQUEST;

  if (typeof msg.error === 'number') return Types.RESPONSE;

  return Types.UNKNOWN;
};

const postRequest = function (ws, req) {
  if (req.ws && req.ws === ws) {
    return;
  }
  const msg = JSON.stringify(req, function (key, value) {
    if (key === 'ws' || key === 'mq') {
      // exclude property ws from resulting JSON string
      return undefined;
    }
    return value;
  });
  console.log('\nWB postRequest\n'+msg);
  ws.send(msg);
};

const postRequestToApps = function (req) {
  apps[req.deviceid] && apps[req.deviceid].forEach(function (ws) {
    console.log('WB postRequestToApps');
    postRequest(ws, req);
  });
};

protocol.on('device.update', function (req) {
  postRequestToApps(req);
});

protocol.on('device.online', function (req) {
  postRequestToApps(req);
});

protocol.on('app.update', function (req) {
  devices[req.deviceid] && devices[req.deviceid].forEach(function (ws) {
    // Transform timers for ITEAD indie device
    console.log('\nWB postRequestToDevice');
    postRequest(ws, protocol.utils.transformRequest(req));
  });
});

/**
 * Exports
 */
module.exports = function (httpServer) {
  const server = new Server({
    server: httpServer,
    path: '/api/ws'
  });

  server.on('connection', function (ws) {
    ws.devices = [];

    ws.on('message', function (msg) {
      try {
        msg = JSON.parse(msg);
      }
      catch (err) {
        // Ignore non-JSON message


        return;
      }

      switch (getType(msg)) {
        case Types.UNKNOWN:
          return;

        case Types.RESPONSE:
          console.log('WB RESPONSE');
          protocol.postResponse(msg);
          return;

        case Types.REQUEST:
          console.log('WB REQUEST');
          msg.ws = ws;
          protocol.postRequest(msg, function (res) {
            // Transform timers for ITEAD indie device
            if (protocol.utils.fromDevice(msg) &&
              protocol.utils.isFactoryDeviceid(msg.deviceid)) {
              res = protocol.utils.transformResponse(res);
            }
            ws.send(JSON.stringify(res));

            if (res.error) return;

            // Message sent from device
            if (protocol.utils.fromDevice(msg)) {
              devices[msg.deviceid] = devices[msg.deviceid] || [];

              if (devices[msg.deviceid][0] === ws) return;

              devices[msg.deviceid] = [ws];
              ws.devices.push(msg.deviceid);
              protocol.postMessage({
                type: 'device.online',
                deviceid: msg.deviceid,
                online: true
              });

              return;
            }

            // Message sent from apps
            apps[msg.deviceid] = apps[msg.deviceid] || [];

            if (apps[msg.deviceid].indexOf(ws) !== -1) return;

            apps[msg.deviceid].push(ws);
            ws.devices.push(msg.deviceid);
          });
      }
    });

    ws.on('close', function () {
      clean(ws);
    });

    ws.on('error', function () {
      clean(ws);
    });
  });

};

