const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
    message: { type: String, required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    authorType: { type: Number, required: true }, 
    edited: { type: Boolean, default: false },
    dateCreated: { type: Date, default: Date.now },
    dateEdited: { type: Date },
    // TODO: replies
  });