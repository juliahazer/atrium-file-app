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

/*NOTE: variables to help transfer data between POST file-search & redirect to GET file-search-results*/
//to store array of file names found during search
var fileMatchArr;
//to store search text
var searchText;

router.get('/file-upload', authMiddleware.loginRequired, function(req,res){
  //find all existing files to display
  db.File.find().then(function(files){
    res.render('file-upload', {files})
  }, function(err){
    res.send("ERROR!");
  });
});

//user multer module as middleware to handle file upload
router.post('/file-upload', authMiddleware.loginRequired, upload.single('upload'), function(req, res){
  //also create a new File record in the database
  db.File.create({
    name: req.file.originalname,
    type: req.file.mimetype,
    description: req.body.description,
    uploadDate: Date.now()
  });

  res.redirect('/files/file-upload');
});

//display file search form (to search files for matching text)
router.get('/file-search', authMiddleware.loginRequired, function(req,res){
  res.render('file-search');
});

//display file search results
router.get('/file-search-results', authMiddleware.loginRequired, function(req,res){
  //searchText & fileMatchArr info set in the POST /file-search route
  res.render('file-search-results', {searchText, files: fileMatchArr});
});

//SEARCH FILES FOR MATCHING SEARCH TEXT (upon search form submission)
router.post('/file-search', authMiddleware.loginRequired, function(req, res){
  //remove any excess white space from user-entered search text
  searchText = req.body.search.trim();
  var path = "./uploads";
  fileMatchArr = [];
  let promiseArr = [];
  fs.readdirAsync(path).map(file => {
    var fileTypeInfo;
    var fileName;
    //used to get file type
    var buffer = readChunk.sync(path + "/" + file, 0, 4100);
    if (fileType(buffer) !== null) {
      //grab file type
      fileTypeInfo = fileType(buffer).mime;
      //only search in PDFs and WordDocs
      if ((fileTypeInfo === 'application/pdf' ||
        fileTypeInfo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') &&
        file !== ".DS_Store") {
        fileName = file;

        /*if file name contains searchText (regardless of case) add the file name to fileMatchArr (results)*/
        if (fileName.toUpperCase().indexOf(searchText.toUpperCase()) !== -1) {
          fileMatchArr.push(fileName);
        /*otherwise search contents of the file...*/
        } else {
          var currPromise = new Promise((resolve, reject) => {
            /* use textract module to search the contents
            of the Word/PDF files*/
            textract.fromFileWithPath(path + "/" + file, function( error, text ) {
              /*if file contents contains searchText (regardless of case) add the file name to fileMatchArr (results)*/
              if (text.toUpperCase().indexOf(searchText.toUpperCase()) !== -1) {
                fileMatchArr.push(fileName);
              }
              resolve();
            });
          });
          //since async, add the promise to promiseArr
          promiseArr.push(currPromise);
        }
      }
    }
  }).then(() => {
    //ensure finished checking contents of all files
    //before redirecting to display results
    Promise.all(promiseArr).then(() => {
      if (fileMatchArr.length === 0) {
        fileMatchArr = ['No matching files found!'];
      }
      return res.redirect('/files/file-search-results');
    });
  });
});

module.exports = router;
