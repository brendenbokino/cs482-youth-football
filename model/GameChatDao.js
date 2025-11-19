const mongoose = require("mongoose");
const gameDao = require('./GameDao');

const replySchema = new mongoose.Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const gameChatSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  message: { type: String, default: "" }, 
  author: { type: String, required: true },
  authorType: { type: Number, required: true },
  photo: { type: String }, 
  video: { type: String }, 
  edited: { type: Boolean, default: false },
  dateCreated: { type: Date, default: Date.now },
  dateEdited: { type: Date },
  replies: [replySchema],
});

const gameChatModel = mongoose.model('GameChat', gameChatSchema);

module.exports = {
  async create(data) {
      return await messageModel.create(data);
  },

  async readAll() {
      return await messageModel.find().sort({ date: -1 }).lean();
  },

  async findById(id) {
      return await messageModel.findById(id);
  },

  async addReply(id, reply) {
      const msg = await messageModel.findById(id);
      if (!msg) return null;
      msg.replies.push({ ...reply, date: new Date() });
      await msg.save();
      return msg;
  },

  async addPhoto(id, photoUrl) {
      const msg = await messageModel.findById(id);
      if (!msg) return null;
      msg.photo = photoUrl;
      await msg.save();
      return msg;
  },

  async delete(id) {
      return await messageModel.findByIdAndDelete(id);
  },

  async isAuthor(messageId, userName) {
      const message = await messageModel.findById(messageId);
      return message && message.author === userName;
  },

  async update(id, updates) {
      updates.edited = true;
      updates.dateEdited = new Date();
      return await messageModel.findByIdAndUpdate(id, updates, { new: true });
  },

  async createForGame(gameId, data) {
    const game = await gameDao.read(gameId);
    const now = new Date();

    if (!game) {
      throw new Error('Game not found');
    }

    if (now < new Date(game.startTime) || now > new Date(game.endTime)) {
      throw new Error('Chats can only be added during the game time');
    }

    return await gameChatModel.create({ gameId, ...data });
  },
};
