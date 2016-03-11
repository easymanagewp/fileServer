/**
 * 文件
 */
var datasource = require('../datasource');
var $ = require('../utils');
var base_dao = require('./base_dao');

var file_schema = datasource.mongoose.Schema({
    name  : String,         // 文件名
    path : String,          // 文件路径
    type : String,          // 文件类型
    size : Number,          // 文件大小
    uploadTime : Number     // 上传时间
});

var file_model = datasource.db.model('file',file_schema);

module.exports = $.extend(new base_dao(file_model,file_schema));