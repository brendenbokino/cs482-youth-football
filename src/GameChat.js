// Iteration #3
// Game Chat
// Loren Kim

const express = require("express");
const GameChatDao = require('../model/GameChatDao');

const app = express();
app.use(express.json());

class GameChat {
    constructor() {
        this.currentUser = null;
    }

    async viewMessages() {
        if (!this.currentUser) {
            console.log("Please log in to view messages.");
            return;
        }

        const messages = await GameChatDao.readAll();
        if (!messages.length) {
            console.log("No messages.");
            return;
        }

        console.log("\nMessage Board:");
        messages.forEach((msg, i) => {
            console.log(`${i + 1}. [${new Date(msg.dateCreated).toLocaleString()}] ${msg.author}: ${msg.message}`);
            if (msg.replies && msg.replies.length > 0) {
                msg.replies.forEach((r, j) => {
                    console.log(`   ↳ Reply ${j + 1} by ${r.email} [${new Date(r.date).toLocaleString()}]: ${r.message}`);
                });
            }
        });
    }
}

app.post('/calendar/postMessage', isAuthenticated, async (req, res) => {
    const { message, gameId } = req.body; 
    const user = req.session.user;

    if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Message cannot be empty." });
    }

    if (!gameId) {
        return res.status(400).json({ error: "Game ID is required." });
    }

    try {
        const newMessage = await GameChatDao.create({
            gameId,
            message,
            dateCreated: new Date(),
            author: user.name,
            authorType: user.permission,
        });
        res.status(200).json({ success: true, newMessage });
    } catch (err) {
        console.error("Error posting message:", err); 
        res.status(500).json({ error: "Failed to post message", details: err.message });
    }
});

app.get('/calendar/viewMessages/:gameId', isAuthenticated, async (req, res) => {
    const { gameId } = req.params;

    try {
        console.log(`Fetching messages for gameId: ${gameId}`); // Debugging log
        const messages = await GameChatDao.readByGameId(gameId); // Filter by gameId
        console.log(`Messages fetched for gameId ${gameId}:`, messages); // Log the fetched messages
        res.json({ messages });
    } catch (err) {
        console.error("Error fetching messages:", err); // Log the error
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

app.post('/calendar/uploadPhoto', isAuthenticated, upload.single('photo'), async (req, res) => {
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

app.post('/calendar/uploadVideo', isAuthenticated, upload.single('video'), async (req, res) => {
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

module.exports = GameChat;
