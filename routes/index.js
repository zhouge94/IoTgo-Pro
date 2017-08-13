/**
 * Dependencies
 */
var express = require('express');
var db = require('../db/index');
var http = require('./http');
var config = require('../config');
var user = require('./user');
var admin = require('./admin');
var devices = require('./devices');
var debug = require('debug')('iotgo');

/**
 * Connect to database first
 */
db.connect(config.db.uri, config.db.options);
db.connection.on('error', function (err) {
    console.log('Connect to DB failed!');
    debug('Connect to DB failed!');
    debug(err);
    process.exit(1);
});
db.connection.on('open', function () {
    console.log('Connect to DB successful!');
    debug('Connect to DB successful!');
});

var router = express.Router();

router.route('/http').post(http).all(function (req, res) {
    res.send(405).end();
});

router.use('/user', user);
router.use('/admin', admin);
router.use('/devices', devices);

module.exports = router;