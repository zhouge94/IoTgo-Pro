const util = require('util');

module.exports.success = (data, msg) => {
    return {
        result: 1,
        msg: msg ? msg : "操作成功",
        data: data
    }
}

module.exports.error = (msg, err) => {
    return {
        result: 0,
        msg: msg ? msg : "操作失败",
        data: err ? [err] : []
    }
}

module.exports.dbErr = (err, msg) => {
    return {
        result: 2,
        msg: msg ? msg : "数据库操作失败",
        data: [err]
    }
}

/*
 *获取介于min和max之间的随机数
 */
module.exports.getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
