// Iteration #3
// Game Chat
// Loren Kim

const express = require("express");
const GameChatDao = require("../model/GameChatDao");

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
                    console.log(
                        `   ↳ Reply ${j + 1} by ${r.email} [${new Date(r.date).toLocaleString()}]: ${r.message}`
                    );
                });
            }
        });
    }
    
    async viewMessagesByGameId(gameId) {
      try {
          const messages = await GameChatDao.readByGameId(gameId);
          return { messages };
      } catch (err) {
          return { error: "Failed to fetch messages", details: err.message };
      }
    }
  
}

module.exports = GameChat;
