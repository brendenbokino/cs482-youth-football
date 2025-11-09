// Iteration #2
// Communications
// Loren Kim

const express = require("express");
const MessageDao = require('../model/MessageDao');

class Comms {
    constructor() {
        this.currentUser = null;
    }

    async viewMessages() {
        if (!this.currentUser) {
            console.log("Please log in to view messages.");
            return;
        }

        const messages = await MessageDao.readAll();
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

module.exports = Comms;
