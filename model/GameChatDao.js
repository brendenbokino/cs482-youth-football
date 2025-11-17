const mongoose = require("mongoose");

const gameChatSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  message: { type: String, required: true },
  author: { type: String, required: true },
  authorType: { type: Number, required: true },
  dateCreated: { type: Date, default: Date.now },
});

const gameChatModel = mongoose.model('GameChat', gameChatSchema);

module.exports = {
  async create(data) {
    return await gameChatModel.create(data);
  },

  async readByGameId(gameId) {
    return await gameChatModel.find({ gameId }).sort({ dateCreated: 1 }).lean();
  },

  async deleteByGameId(gameId) {
    return await gameChatModel.deleteMany({ gameId });
  },
};
