const mongoose = require("mongoose");
const gameDao = require('./GameDao');

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

  async readByGameId(gameId) {
    return await gameChatModel.find({ gameId }).sort({ dateCreated: 1 }).lean();
  },

  async deleteByGameId(gameId) {
    return await gameChatModel.deleteMany({ gameId });
  },
};
