const express = require('express'); //import express server
const session = require('express-session');
const memorystore = require('memorystore')(session);
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const { GridFSBucket } = require('mongodb');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const {ObjectID} = mongoose.Types
const Coach = require('./src/Coach');
const UserDao = require('./model/UserDao');
const Comms = require('./src/Comms'); 
const MessageDao = require('./model/MessageDao');
const { login, register, logout, loggedUser } = require('./src/UserController');

app = express()

app.use(session({
  secret: 'Pineapple - Guava - Orange',
  cookie: {maxAge: 86400000 }, // = 1000*60*60*24 = 24Hours
  store: new memorystore({ checkPeriod:86400000 }),
  resave: false,
  saveUninitialized: true
}));

app.use(express.json());
//app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));


//init GFS
/**let bucket;

mongoose.connection.once('open', () => {
    //init stream
    //gfs = Grid(mongoose.connection.db, mongoose.mongo);
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    })
    //gfs.collection('uploads');
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

const upload = multer({ storage });**/

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
      return next();
  }
  res.status(401).json({ error: "Unauthorized. Please log in." });
};

//User Controller Functions
const UserController = require('./src/UserController')
// POST /login
app.post('/loginuser', UserController.login);
app.post('/registeruser', UserController.register);

app.get('/logoutuser', UserController.logout);
app.get('/loggeduser', UserController.loggedUser);

//Team Controller Functions
const TeamController = require('./src/TeamController');

//Game Controller Functions
const GameController = require('./src/GameController');






app.use(express.static('view/html'));


// Team & Game APP api endpoint 
app.post('/teamregister', TeamController.register,(req, res) => {
  //res.json({file: req.file});
  res.redirect("/team.html");
  
})

app.get('/teams', TeamController.getAll);

app.get('/teamsid', TeamController.getById);
app.post('/teamsupdate', TeamController.update);
app.post('/teamsaddplayer', TeamController.addPlayer);

// game routes (Express-friendly wrappers)
app.post('/gameCreate', GameController.create);

app.get('/games', GameController.getAll);
app.put('/games/:id', GameController.update);
app.delete('/games/:id', GameController.delete);


//FILE STORAGE
app.use(express.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));

//initialize connection to db
let bucket;

mongoose.connection.once('open', () => {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    })
})

//create storage
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

const upload = multer({ storage });

app.get('/photos.html', (req, res) =>{
  const cursor = bucket.find({});
  const files = cursor.toArray();
  if (!files || files.length == 0){
    res.render('/photos.html', {files: false})
  } else{
    files.map(file => {
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
        file.isImage = true;
      } else{
        file.isImage = false;
      }
    });
    res.render('/photos.html', {files: files})
  }
})

//upload file to db
app.post('/upload', upload.single('file'), (req, res) => {
  //res.json({file: req.file});
  res.redirect('/')
});

// display all files in JSON
app.get("/files", async (req, res) => {
  const cursor = bucket.find({});
  const files = await cursor.toArray();
  if (!files || files.length == 0){
    res.json({err: 'no files exist'})
  }
  else{
    res.json(files)
  }
});

// display single file in JSON
app.get("/files/:filename", async (req, res) => {
  try {
      const cursor = bucket.find({filename: req.params.filename});
      const file = await cursor.next();
      
      res.json(file);
  } catch (err) {
      res.json({err: 'file doesnt exist'})
  }
});

// display image
app.get("/image/:filename", async (req, res) => {
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
});

// delete file NEED TO UPDATE FROM GRIDFS TO GRIDFSBUCKET
/**app.delete('/files/:id', (req, res) => {
  gfs.remove({_id: req.params.id, root: 'uploads'}, (err, gridStore) => {
    if (err) {
      return res.status(404).json({err: err})
    }
    res.redirect('/')
  })
})**/


// coach account routes
app.post('/coach/createaccount', async (req, res) => {
    const coach = new Coach();
    coach.userInput = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        username: req.body.username,
        permission: parseInt(req.body.permission, 10)
    };
    await UserDao.create(coach.userInput);
    res.send("Coach account created.");
});

app.post('/viewaccount', async (req, res) => {
    const { email } = req.body;
    const user = await UserDao.findLogin(email);
    if (user) {
        res.json({ message: "Account Info", user });
    } else {
        res.status(404).json({ message: "Account not found" });
    }
});

app.post('/updateaccount', async (req, res) => {
    const { email, field, value } = req.body;
    const user = await UserDao.findLogin(email);
    if (!user) {
        return res.status(404).json({ message: "Account not found" });
    }
    const updates = { [field]: value };
    const updatedUser = await UserDao.update(user._id, updates);
    res.json({ message: "Account updated", updatedUser });
});

app.post('/deleteaccount', async (req, res) => {
    const { email } = req.body;
    const user = await UserDao.findLogin(email);
    if (!user) {
        return res.status(404).json({ message: "Account not found" });
    }
    await UserDao.del(user._id);
    res.json({ message: "Account deleted" });
});

// Communications
const comms = new Comms();

app.get('/loggedUser', (req, res) => {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

// changed to handle sessions
app.post('/comms/postMessage', isAuthenticated, async (req, res) => {
  const { message } = req.body;
  const user = req.session.user;

  try {
    const newMessage = await MessageDao.create({
      message,
      author: user.name,
      authorType: user.permission,
    });
    res.status(200).json({ success: true, newMessage });
  } catch (err) {
    res.status(500).json({ error: "Failed to post message", details: err.message });
  }
});

app.get('/comms/viewMessages', isAuthenticated, async (req, res) => {
  try {
    const messages = await MessageDao.readAll();
    res.json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err); 
    res.status(500).json({ error: "Failed to fetch messages", details: err.message });
  }
});

app.delete('/comms/deleteMessage/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;

  try {
    const isAuthor = await MessageDao.isAuthor(id, user.name);
    if (!isAuthor) {
      return res.status(403).json({ error: "You are not authorized to delete this message." });
    }
    await MessageDao.delete(id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message", details: err.message });
  }
});

app.put('/comms/updateMessage/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const user = req.session.user;

  try {
    const isAuthor = await MessageDao.isAuthor(id, user.name);
    if (!isAuthor) {
      return res.status(403).json({ error: "You are not authorized to update this message." });
    }
    const updatedMessage = await MessageDao.update(id, { message });
    res.status(200).json({ success: true, updatedMessage });
  } catch (err) {
    res.status(500).json({ error: "Failed to update message", details: err.message });
  }
});

exports.app = app;