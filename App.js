const express = require('express'); //import express server
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


app = express()


app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));

//init GFS
var gfs;

mongoose.connection.once('open', () => {
    //init stream
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('photos');
})

//create storage option
const storage = new GridFsStorage({
    url: process.env.FILESDB_URI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'photos'
          };
          resolve(fileInfo);
        });
      });
    }
});
const upload = multer({ storage });


app.use(express.static('view/html'));

// @route POST /upload
app.post('/upload', upload.single('file'), (req, res) => {
    res.json({file: req.file});
})

exports.app = app;