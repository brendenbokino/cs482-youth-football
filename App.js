const express = require('express'); //import express server

const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const {ObjectID} = mongoose.Types
const methodOverride = require('method-override');
const Coach = require('./src/Coach');
const UserDao = require('./model/UserDao');
const Comms = require('./src/Comms'); 

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

//User Controller Functions
const UserController = require('./src/UserController')
// POST /login
app.post('/loginuser', UserController.login);
app.post('/registeruser', UserController.register);

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

//File Storage Functions

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
      res.json({err: 'no files exist'})
  }
});

// GET /files/:filename
// display single file in JSON

app.get("/files/:filename", async (req, res) => {
  try {
      let file = await gfs.files.findOne({filename: req.params.filename});
      res.json(file);
  } catch (err) {
      res.json({err: 'file doesnt exist'})
  }
});

// GET /files/:filename
// display image

app.get("/image/:filename", async (req, res) => {
  let file;
  try {
      file = await gfs.files.findOne({filename: req.params.filename});
      //res.json(file);
  } catch (err) {
      res.json({err: 'file doesnt exist'})
  }

  //check if image
  if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
    // read output to browser
    let readstream = gfs.createReadStream({filename: file.filename});
    readstream.pipe(res);
  } else {
    res.status(404).json({
      err: 'Not an image'
    })
  }
});

// DELETE /files/:id
// delete file
app.delete('/files/:id', (req, res) => {
  gfs.remove({_id: req.params.id, root: 'uploads'}, (err, gridStore) => {
    if (err) {
      return res.status(404).json({err: err})
    }
    res.redirect('/')
  })
})


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

app.post('/comms/postMessage', async (req, res) => {
    const { message, author } = req.body;
    const date = new Date();s
    comms.messages.push({ message, author, date });
    res.json({ message: "Message posted successfully", data: { message, author, date } });
});

app.get('/comms/viewMessages', (req, res) => {
    res.json({ messages: comms.messages });
});

exports.app = app;