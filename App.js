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
app.get('/user/name/:id', UserController.getUserName)

app.post('/promotetoadult', UserController.promoteToAdult);

app.post('/adult/createyouth', UserController.createYouthAccount);
app.get('/adult/viewyouths', UserController.getYouths);
app.get('/adult/viewinvites', UserController.getAdultYouthInvites);
app.post('/adult/approveinvite', UserController.addYouthToTeam);
app.get('/coach/viewyouths', UserController.getYouths);
app.get('/coach/viewinvites/:youthId', UserController.getYouthInvites);
app.post('/coach/inviteyouth', UserController.inviteYouthToTeam);
app.delete('/invites/:id', UserController.deleteInvite);
app.post('/youth/addstat', isAuthenticated, UserController.addYouthStat);
app.get('/youth/:userId', UserController.getYouthByUserId);
app.get('/coaches', UserController.getAllCoaches);

//Team Controller Functions
const TeamController = require('./src/TeamController');

//Game Controller Functions
const GameController = require('./src/GameController');

app.get('/profile', (req, res) => {
  if (req.session && req.session.user && req.session.user._id) {
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

app.get('/teams/coach/:id', TeamController.getByCoachId);
app.get('/teams/:id', TeamController.getById);
app.get('/teams/:id/players', TeamController.viewYouthOnTeam);
app.post('/teamsupdate', TeamController.update);
app.post('/teamsaddplayer', TeamController.addPlayer);
app.post('/teamsupdaterecord', TeamController.updateRecord, (req, res) => {
  res.redirect("/team.html");
});



// game routes (Express-friendly wrappers)
app.post('/gameCreate', async (req, res) => {
  try {
    console.log('gameCreate - Request body:', req.body);
    const { team1_id, team2_id, date, startTime, endTime, location, link } = req.body;
    console.log('gameCreate - Extracted values:', { team1_id, team2_id, date, startTime, endTime, location, link });
    
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
      id_team1: team1_id,
      id_team2: team2_id,
      date: gameDate,
      startTime: start,
      endTime: end,
      location,
      link,
    };

    console.log('Creating new game:', newGame); // Debugging log
    const createdGame = await GameDao.create(newGame);
    console.log('gameCreate - Game created successfully:', createdGame);
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
app.get('/games/:id/score', GameController.getGameScore);
app.get('/games/:id/stats', GameController.getGameStats);



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
const CoachController = require('./src/CoachController');

app.post('/coach/createaccount', CoachController.createAccount);

app.post('/viewaccount', CoachController.viewAccount);

app.post('/updateaccount', CoachController.updateAccount);

app.post('/deleteaccount', CoachController.deleteAccount);

// Communications
const comms = new Comms();

app.get('/loggedUser', (req, res) => {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ loggedIn: false });
  }
});


const CommsController = require('./src/CommsController');
const upload = multer({ dest: 'uploads/' }); 

app.post('/comms/postMessage', isAuthenticated, CommsController.postMessage);
app.get('/comms/viewMessages', isAuthenticated, CommsController.viewMessages);
app.delete('/comms/deleteMessage/:id', isAuthenticated, CommsController.deleteMessage);
app.put('/comms/updateMessage/:id', isAuthenticated, CommsController.updateMessage);
app.post('/comms/addReply/:id', isAuthenticated, CommsController.addReply);
app.use('/uploads', express.static('uploads')); 
app.post('/comms/uploadPhoto', isAuthenticated, upload.single('photo'), CommsController.uploadPhoto);
app.post('/comms/uploadVideo', isAuthenticated, upload.single('video'), CommsController.uploadVideo);



const ReviewDao = require('./model/ReviewDao')

app.post('/postReview', isAuthenticated, async (req, res) => {
  const reviewToSend  = req.body.reviewBody;
  const teamToSend = req.body.team;
  const user = req.session.user;
  //console.log('req.body.team', req.body.team);
  //console.log('req.body.reviewBody: ', req.body.reviewBody)
  //console.log('reviewToSend: ', reviewToSend)

  try {
    const newReview = await ReviewDao.create({
      review: reviewToSend,
      author: user.name,
      authorType: user.permission,
      team: teamToSend,
    });
    //res.status(200).json({ success: true, newReview });
    res.redirect('/reviews.html')
  } catch (err) {
    res.status(500).json({ error: "Failed to post review", details: err.message });
  }
});

app.get('/viewReviews', async (req, res) => {
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

app.put('/updateReview/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { review } = req.body;
  const user = req.session.user;

  try {
    const isAuthor = await ReviewDao.isAuthor(id, user.name);
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

const CalendarController = require('./src/CalendarController');

app.post('/calendar/postMessage', isAuthenticated, CalendarController.postMessage);
app.get('/calendar/viewMessages', isAuthenticated, CalendarController.viewMessages);
app.delete('/calendar/deleteMessage/:id', isAuthenticated, CalendarController.deleteMessage);
app.put('/calendar/updateMessage/:id', isAuthenticated, CalendarController.updateMessage);
app.post('/calendar/addReply/:id', isAuthenticated, CalendarController.addReply);

exports.app = app;