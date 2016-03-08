/* 数据库配置 */
var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require('mongoose'));
//120.27.103.105
var db = mongoose.createConnection('mongodb://localhost:27017/fileServer');

// 链接错误
db.on('error', function(error) {
    console.log(error);
});

exports.mongoose = mongoose;
exports.db = db;


