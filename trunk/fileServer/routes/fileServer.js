var express = require('express');
var multipart = require('connect-multiparty');
var promise = require('bluebird');
var fs = promise.promisifyAll(require('fs'));
var path = require('path');
var evn = require('../evn');
var uuid = require('node-uuid');
var fileDao = require('../dao/file');

/**
 * 创建文件夹
 * @param dirpath
 * @returns {boolean}
 */
fs.mkdirsSync = function(dirpath){
    dirpath.replace('/',path.sep);
    var pathtemp =path.sep;
    dirpath.split(path.sep).forEach(function(dirName){
        pathtemp = path.join(pathtemp,dirName);
        if(!fs.existsSync(pathtemp)){
            if(!fs.mkdirSync(pathtemp)){
                return false;
            }
        }
    });

    return true;
};

var router = express.Router();


var mulitipartMiddleware = multipart({
    uploadDir : evn.tempUploadDir
});

router.get('/test.html',function(req,res){
    res.render('index');
});

var getStoreDir = function(){
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth()+1;
    var day = currentDate.getDate();

    var storeDir = year + path.sep + month + path.sep + day;

    return storeDir;
};

/*
  文件上传
 */
router.post('/upload.do', mulitipartMiddleware,function(req, res, next) {
    var files = req.files;
    // 判断文件库是否存在
    if (!fs.existsSync(evn.fileStoreDir)) {
        // 文件库不存在,创建文件库
        fs.mkdirsSync(evn.fileStoreDir);
    }
    var currentFileStoreDir = getStoreDir();
    var currentFileStoreRealDir = path.join(evn.fileStoreDir,currentFileStoreDir);

    if(!fs.existsSync(currentFileStoreRealDir)){
        fs.mkdirsSync(currentFileStoreRealDir);
    }

    var result = {};
    var eachIndex = 0;
    var countFile = 0;
    for(var key in files){
        countFile++;
    }

    function response(){
        if(eachIndex == countFile) {
            res.json(result);
        }
    }

    for(var key in files){
        var file = files[key];
        var fileStartName = uuid.v4();
        var fileName = fileStartName + "___" + file.originalFilename;
        var httpPath = currentFileStoreDir + "/" + fileName;
        result[file.originalFilename] = 'fail';

        fileDao.saveAsync({
            name  : file.originalFilename,
            path : httpPath,
            type : file.type,
            size : file.size,
            uploadTime : new Date().getTime()
        }).then(function(file,currentFileStoreRealDir,fileName){
            return function(storedFile){
                eachIndex ++;
                fs.writeFileSync(currentFileStoreRealDir+ path.sep +fileName,fs.readFileSync(file.path));
                fs.unlinkSync(file.path);
                result[file.originalFilename] = 'ok';
                response();
            }
        }(file,currentFileStoreRealDir,fileName)).catch(function(file,currentFileStoreRealDir,fileName){
            return function(e){
                eachIndex ++;
                fs.unlinkSync(currentFileStoreRealDir+ path.sep +fileName);
                response();
            }
        }(file,currentFileStoreRealDir,fileName));
    }
});

/*
  文件下载
 */
router.get('/download/:id.do',function(req,res){
    var fileId = req.params.id;

    fileDao.findByIdAsync(fileId).then(function(storeFile){
        var filePath = storeFile.path;
        var fileRealPath = path.join(evn.fileStoreDir,filePath);
        console.info(fileRealPath);
        res.download(fileRealPath,storeFile.name);
    });
});

router.get('/',function(req,res){
    fileDao.findAsync().then(function(storeFiles){
       res.render('index.html',{files:storeFiles});
    });
});

module.exports = router;
