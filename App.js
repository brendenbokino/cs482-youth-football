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
const GameChatDao = require('./model/GameChatDao');
const GameDao = require('./model/GameDao'); 

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

app.get('/user/:id', UserController.getUserById);

app.post('/promotetoadult', UserController.promoteToAdult);

app.post('/adult/createyouth', UserController.createYouthAccount);
app.get('/adult/viewyouths', UserController.getYouths);
app.get('/coach/viewyouths', UserController.getYouths);
app.post('/youth/addstat', isAuthenticated, UserController.addYouthStat);

//Team Controller Functions
const TeamController = require('./src/TeamController');

//Game Controller Functions
const GameController = require('./src/GameController');

app.get('/profile', (req, res) => {
  if (req.session && req.session.user) {
    res.redirect(`/profile.html?id=${req.session.user._id.toString()}`);
  } else {
    res.redirect('/login.html');
  }
});


app.use(express.static('view/html'));


// Team & Game APP api endpoint 
app.post('/teamregister', TeamController.register,(req, res) => {
  //res.json({file: req.file});
  res.redirect("/team.html");
  
})

app.get('/teams', TeamController.getAll);

app.get('/teams/:id', TeamController.getById);
app.post('/teamsupdate', TeamController.update);
app.post('/teamsaddplayer', TeamController.addPlayer);
app.post('/teamsupdaterecord', TeamController.updateRecord, (req, res) => {
  res.redirect("/team.html");
});



// game routes (Express-friendly wrappers)
app.post('/gameCreate', async (req, res) => {
  try {
    const { team1, team2, date, startTime, endTime, location, link } = req.body;
    const gameDate = new Date(date);
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid startTime or endTime format." });
    }

    if (start >= end) {
      return res.status(400).json({ error: "End time must be after start time." });
    }

    const newGame = {
      team1,
      team2,
      date: gameDate,
      startTime: start,
      endTime: end,
      location,
      link,
    };

    console.log('Creating new game:', newGame); // Debugging log

    const createdGame = await GameDao.create(newGame);
    res.status(201).json({ success: true, createdGame });
  } catch (err) {
    console.error('Error in /gameCreate:', err.message); // Debugging log
    res.status(500).json({ error: "Failed to create game", details: err.message });
  }
});

app.get('/games', GameController.getAll);

app.get('/games/:id', GameController.getById);
app.put('/games/:id', GameController.update);

/*app.put('/games/:id', async (req, res) => {
  try {
    const { team1, team2, date, startTime, endTime, location, link } = req.body;
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (start >= end) {
      return res.status(400).json({ error: "End time must be after start time." });
    }

    const updatedGame = await GameDao.update(req.params.id, {
      team1,
      team2,
      date: new Date(date),
      startTime: start,
      endTime: end,
      location,
      link,
    });

    res.status(200).json({ success: true, updatedGame });
  } catch (err) {
    res.status(500).json({ error: "Failed to update game", details: err.message });
  }
});*/

app.delete('/games/:id', GameController.delete);

// Game score and stats routes (admin only)
app.put('/games/:id/score', isAuthenticated, GameController.updateScore);
app.post('/games/:id/stats', isAuthenticated, GameController.addPlayerStat);


//FILE STORAGE
app.use(express.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));

const FileStorage = require('./src/FileStorage');

app.get('/photos/images', FileStorage.getImages)

app.post('/upload', FileStorage.uploadFile, (req, res) => {
  res.redirect('/photos.html')
});


app.get('/files', FileStorage.getFiles);

app.get('/files/:filename', FileStorage.getFile);

app.get('/image/:filename', FileStorage.getImage);

const { ObjectId } = require('mongoose')

app.post('/files/:filename', FileStorage.deleteFile);


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
  //const { gameId } = req.query;
  //console.log(`Received gameId in query: ${gameId}`); 

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

app.post('/comms/addReply/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    const user = req.session.user;

    try {
        const reply = {
            email: user.email,
            message,
        };
        const updatedMessage = await MessageDao.addReply(id, reply);
        if (updatedMessage) {
            res.status(200).json({ success: true, updatedMessage });
        } else {
            res.status(404).json({ error: "Message not found." });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to add reply", details: err.message });
    }
});


app.post('/comms/uploadPhoto', isAuthenticated, FileStorage.uploadPhoto, async (req, res) => {
  /*const { message } = req.body;
  const user = req.session.user;*/

//app.post('/comms/uploadPhoto', isAuthenticated, upload.single('photo'), async (req, res) => {
    const user = req.session.user;


    try {
        const message = req.body.message || "(no message)"; 
        console.log("Received message:", message);

        const newMessage = await MessageDao.create({
            message,
            author: user.name,
            authorType: user.permission,
            photo: req.file.buffer,
            photoMime: req.file.mimetype
        });

        console.log("Photo message saved successfully:", newMessage);
        res.status(200).json({ success: true, newMessage });
    } catch (err) {
        console.error("Error saving photo message:", err);
        res.status(500).json({ error: "Failed to upload photo", details: err.message });
    }
});


app.post('/comms/uploadVideo', isAuthenticated, FileStorage.uploadVideo, async (req, res) => {
  /*const { message } = req.body;
  const user = req.session.user;*/

//app.post('/comms/uploadVideo', isAuthenticated, upload.single('video'), async (req, res) => {
    const user = req.session.user;


    try {
        const newMessage = await MessageDao.create({
            message: req.body.message || "",
            author: user.name,
            authorType: user.permission,
            video: req.file.buffer,
            videoMime: req.file.mimetype
        });
        res.status(200).json({ success: true, newMessage });
    } catch (err) {
        res.status(500).json({ error: "Failed to upload video", details: err.message });
    }
});

app.get('/image/:id', async (req, res) => {
    const msg = await MessageDao.findById(req.params.id);
    if (!msg || !msg.photo) return res.status(404).send("Not found");

    res.contentType(msg.photoMime);
    res.send(msg.photo);
});

app.get('/video/:id', async (req, res) => {
    const msg = await MessageDao.findById(req.params.id);
    if (!msg || !msg.video) return res.status(404).send("Not found");

    res.contentType(msg.videoMime);
    res.send(msg.video);
});

/*
app.post('/gameChat/:gameId', isAuthenticated, async (req, res) => {
  const { gameId } = req.params;
  const { message } = req.body;
  const user = req.session.user;

  try {
    const game = await GameDao.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    const now = new Date();
    const gameStart = new Date(game.date);
    const gameEnd = new Date(game.date);
    gameEnd.setHours(gameEnd.getHours() + 2); // keeping the games at 2 hours, no OT

    if (now < gameStart || now > gameEnd) {
      return res.status(403).json({ error: "Chat is only allowed during the game." });
    }

    const newChat = await GameChatDao.create({
      gameId,
      message,
      author: user.name,
      authorType: user.permission,
    });

    res.status(200).json({ success: true, newChat });
  } catch (err) {
    res.status(500).json({ error: "Failed to post chat message", details: err.message });
  }
});

app.get('/gameChat/:gameId', isAuthenticated, async (req, res) => {
  const { gameId } = req.params;

  try {
    const chats = await GameChatDao.readByGameId(gameId);
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch game chats", details: err.message });
  }
});*/

const ReviewDao = require('./model/ReviewDao')

app.post('/postReview', isAuthenticated, async (req, res) => {
  const reviewToSend  = req.body.reviewBody;
  const user = req.session.user;
  console.log('req.body.reviewBody: ', req.body.reviewBody)
  console.log('reviewToSend: ', reviewToSend)

  try {
    const newReview = await ReviewDao.create({
      review: reviewToSend,
      author: user.name,
      authorType: user.permission,
    });
    res.status(200).json({ success: true, newReview });
  } catch (err) {
    res.status(500).json({ error: "Failed to post review", details: err.message });
  }
});

app.get('/viewReviews', isAuthenticated, async (req, res) => {
  try {
    const reviews = await ReviewDao.readAll();
    //console.log(reviews);
    res.json({ reviews });
  } catch (err) {
    console.error("Error fetching reviews:", err); 
    res.status(500).json({ error: "Failed to fetch reviews", details: err.message });
  }
});

app.delete('/deleteReview/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  //console.log('req.params: ', req.params)

  try {
    const isAuthor = await ReviewDao.isAuthor(id, user.name);
    if (!isAuthor) {
      return res.status(403).json({ error: "You are not authorized to delete this review." });
    }
    await ReviewDao.delete(id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review", details: err.message });
  }
});

app.put('/teams/updateReview/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { review } = req.body;
  const user = req.session.user;

  try {
    const isAuthor = await ReviewDaoDao.isAuthor(id, user.name);
    if (!isAuthor) {
      return res.status(403).json({ error: "You are not authorized to update this review." });
    }
    const updatedReview = await ReviewDao.update(id, { review });
    res.status(200).json({ success: true, updatedReview });
  } catch (err) {
    res.status(500).json({ error: "Failed to update review", details: err.message });
  }
});

app.get('/checkSession', (req, res) => {
    res.json({ session: req.session });
});

app.post('/calendar/postMessage', isAuthenticated, async (req, res) => {
  const { message, gameId } = req.body;
  const user = req.session.user;

  try {
    console.log("Creating message in database:", { message, gameId, author: user.name, authorType: user.permission });

    const newMessage = await GameChatDao.create({
      message,
      gameId,
      author: user.name,
      authorType: user.permission,
    });

    console.log("Message created successfully:", newMessage);

    res.status(200).json({ success: true, newMessage });
  } catch (err) {
    console.error("Error posting message:", err);
    res.status(500).json({ error: "Failed to post message", details: err.message });
  }
});

app.get('/calendar/viewMessages', isAuthenticated, async (req, res) => {
  const { gameId } = req.query;

  try {
    const messages = await GameChatDao.readByGameId(gameId);
    res.json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err); 
    res.status(500).json({ error: "Failed to fetch messages", details: err.message });
  }
});

app.delete('/calendar/deleteMessage/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;

  try {
    const isAuthor = await GameChatDao.isAuthor(id, user.name);
    if (!isAuthor) {
      return res.status(403).json({ error: "You are not authorized to delete this message." });
    }
    await GameChatDao.delete(id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message", details: err.message });
  }
});

app.put('/calendar/updateMessage/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const user = req.session.user;

  try {
    const isAuthor = await GameChatDao.isAuthor(id, user.name);
    if (!isAuthor) {
      return res.status(403).json({ error: "You are not authorized to update this message." });
    }
    const updatedMessage = await GameChatDao.update(id, { message });
    res.status(200).json({ success: true, updatedMessage });
  } catch (err) {
    res.status(500).json({ error: "Failed to update message", details: err.message });
  }
});

app.post('/calendar/addReply/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    const user = req.session.user;

    try {
        const reply = {
            email: user.email,
            message,
        };
        const updatedMessage = await GameChatDao.addReply(id, reply);
        if (updatedMessage) {
            res.status(200).json({ success: true, updatedMessage });
        } else {
            res.status(404).json({ error: "Message not found." });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to add reply", details: err.message });
    }
});

app.post('/calendar/uploadPhoto', isAuthenticated, FileStorage.uploadPhoto, async (req, res) => {
  const { message } = req.body;
  const user = req.session.user;

  try {
    const photoUrl = `/image/${req.file.filename}`;
    const newMessage = await GameChatDao.create({
      message: message || "", 
      author: user.name,
      authorType: user.permission,
      photo: photoUrl,
    });
    res.status(200).json({ success: true, newMessage });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload photo", details: err.message });
  }
});

app.post('/calendar/uploadVideo', isAuthenticated, FileStorage.uploadVideo, async (req, res) => {
  const { message } = req.body;
  const user = req.session.user;

  try {
    const videoUrl = `/video/${req.file.filename}`;
    const newMessage = await GameChatDao.create({
      message: message || "", 
      author: user.name,
      authorType: user.permission,
      video: videoUrl,
    });
    res.status(200).json({ success: true, newMessage });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload video", details: err.message });
  }
});

exports.app = app;