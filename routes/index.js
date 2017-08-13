/**
 * Dependencies
 */
const express = require('express');
const db = require('../db/index');
const http = require('./http');
const config = require('../config');
const user = require('./user');
const admin = require('./admin');
const devices = require('./devices');
const debug = require('debug')('iotgo');

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

const router = express.Router();

router.route('/http').post(http).all(function (req, res) {
    res.send(405).end();
});

router.use('/user', user);
router.use('/admin', admin);
router.use('/devices', devices);

module.exports = router;