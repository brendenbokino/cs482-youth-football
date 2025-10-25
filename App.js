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

app.use(express.json());
//app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));

//init GFS
var gfs;

mongoose.connection.once('open', () => {
    //init stream
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
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
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
});
//const storage = new GridFsStorage({url: process.env.FILESDB_URI});
const upload = multer({ storage });


app.use(express.static('view/html'));

// POST /upload
app.post('/upload', upload.single('file'), (req, res) => {
    //res.json({file: req.file});
    res.redirect('/')
})

// GET /files
// display all files in JSON
/**app.get('/files', (req, res) => {
  try{
    let files = await gfs.files.find().toArray();
    return res.json(files);
  } catch (err) {
    return res.status(404).json({
      err: 'no files exist'
    })
  }
  gfs.files.find().toArray((err, files) => {
    // check if files
    if(!files || files.length === 0)
      return res.status(404).json({
        err: 'no files exist'
      });
    
    //files exist
    return res.json(files);
  });
});**/

/**app.get("/files", async (req, res) => {
  await gfs.files.find().toArray((err, files) => {
  if (err) return res.status(400).json({ err });
  return res.json(files);
});
});**/
app.get("/files", async (req, res) => {
  try {
      let files = await gfs.files.find().toArray();
      res.json({files})
  } catch (err) {
      res.json({err})
  }
});
exports.app = app;