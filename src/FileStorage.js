const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const {ObjectID} = mongoose.Types

//initialize connection to db
let bucket;

mongoose.connection.once('open', () => {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    })
})

//create storage
const storage = new GridFsStorage({
    url: process.env.DB_URI,
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

const upload = multer({ storage });

exports.getImages = async function(req, res){
    const cursor = bucket.find({});
    let files;
    cursor.toArray()
    .then(function(files){
      if (!files || files.length == 0){
        res.json(files)
      } else{
        for (const file of files){
          if (file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
            file.isImage = true;
          } else{
            file.isImage = false;
          }
        }
        res.json(files)
      }
    })
}

exports.uploadFile = async function(req, res){
    upload.single('file');
}

exports.uploadPhoto = async function(req, res){
    upload.single('photo')
}

exports.uploadVideo = async function(req, res){
    upload.single('video')
}

exports.getFiles = async function(req, res){
    const cursor = bucket.find({});
    const files = await cursor.toArray();
    if (!files || files.length == 0){
        res.json({err: 'no files exist'})
    }
    else{
        res.json(files)
    }
}

exports.getFile = async function(req, res){
    try {
        const cursor = bucket.find({filename: req.params.filename});
        const file = await cursor.next();
        
        res.json(file);
    } catch (err) {
        res.json({err: 'file doesnt exist'})
    }
}

exports.getImage = async function(req, res){
    let file;
    try {
        const cursor = bucket.find({filename: req.params.filename});
        file = await cursor.next();
    } catch (err) {
        res.json({err: 'file doesnt exist'})
    }
    //console.log('file exists')
    //check if image
    if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // read output to browser
        //console.log('file is an image')
        let readstream = bucket.openDownloadStream(file._id);
        //console.log('readstream created')
        readstream.pipe(res);
    } else {
        res.status(404).json({
        err: 'Not an image'
        })
    }
}

exports.deleteFile = async function(req, res){
    let file;
    try {
        const cursor = bucket.find({filename: req.params.filename});
        file = await cursor.next();
        //res.json(file);
    } catch (err) {
        //clres.json({err: 'file doesnt exist'})
            res.redirect('/photos.html')
    }
    await bucket.delete(file._id);
    res.redirect('/photos.html')
}