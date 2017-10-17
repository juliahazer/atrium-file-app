var express = require("express");
var app = express();
var router = express.Router();
var Promise = require('bluebird');
var db = require("../models");
var multer = require('multer');
var textract = require('textract');
var fs = Promise.promisifyAll(require("fs"));
var readChunk = require('read-chunk');
var fileType = require('file-type');
var authMiddleware = require("../middleware/auth")

//https://github.com/expressjs/multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });

var fileMatchArr;
var searchText;

router.get('/file-upload', authMiddleware.loginRequired, function(req,res){
  db.File.find().then(function(files){
    res.render('file-upload', {files})
  }, function(err){
    res.send("ERROR!");
  });
});

router.post('/file-upload', authMiddleware.loginRequired, upload.single('upload'), function(req, res){
  db.File.create({
    name: req.file.originalname,
    type: req.file.mimetype,
    description: req.body.description,
    uploadDate: Date.now()
  });

  res.redirect('/files/file-upload');
});

router.get('/file-search', authMiddleware.loginRequired, function(req,res){
  db.File.find().then(function(files){
    res.render('file-search', {files});
  }, function(err){
    res.send("ERROR!");
  });
});

router.get('/file-search-results', authMiddleware.loginRequired, function(req,res){
  res.render('file-search-results', {searchText, files: fileMatchArr});
});

router.post('/file-search', authMiddleware.loginRequired, function(req, res){
  searchText = req.body.search.trim();
  var path = "./uploads";
  fileMatchArr = [];
  let promiseArr = [];
  fs.readdirAsync(path).map(file => {
      var buffer = readChunk.sync(path + "/" + file, 0, 4100);
      var fileTypeInfo;
      var fileName;
      if (fileType(buffer) !== null) {
        fileTypeInfo = fileType(buffer).mime;
        //only search in PDFs and WordDocs
        if ((fileTypeInfo === 'application/pdf' ||
          fileTypeInfo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') &&
          file !== ".DS_Store") {
          fileName = file;
          if (fileName.toUpperCase().indexOf(searchText.toUpperCase()) !== -1) {
            fileMatchArr.push(fileName);
          } else {
            var currPromise = new Promise((resolve, reject) => {
              textract.fromFileWithPath(path + "/" + file, function( error, text ) {
                if (text.toUpperCase().indexOf(searchText.toUpperCase()) !== -1) {
                  fileMatchArr.push(fileName);
                }
                resolve();
              });
            });
            promiseArr.push(currPromise);
          }
        }
      }
    }).then(() => {
      Promise.all(promiseArr).then(() => {
        if (fileMatchArr.length === 0) {
          fileMatchArr = ['No matching files found!'];
        }
        return res.redirect('/files/file-search-results');
      });
  });
});

module.exports = router;
