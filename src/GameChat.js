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

module.exports = GameChat;
