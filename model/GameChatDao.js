const mongoose = require("mongoose");

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
    // adding message to debug why post isnt working
    try {
        console.log("Creating message in database:", data); 
        const result = await gameChatModel.create(data);
        console.log("Message created successfully:", result); 
        return result;
    } catch (err) {
        console.error("Error creating message in database:", err); 
        throw err; 
    }
  },

  async readAll() {
      return await gameChatModel.find().sort({ date: -1 }).lean();
  },

  async readByGameId(gameId) {
    try {
        console.log(`Querying messages for gameId: ${gameId}`); // Debugging log
        const messages = await gameChatModel.find({ gameId }).sort({ dateCreated: -1 }).lean();
        console.log(`Messages retrieved for gameId ${gameId}:`, messages); // Log the retrieved messages
        return messages;
    } catch (err) {
        console.error("Error querying messages by gameId:", err); // Log the error
        throw err;
    }
  },

  async findById(id) {
      return await gameChatModel.findById(id);
  },

  async addReply(id, reply) {
      const msg = await gameChatModel.findById(id);
      if (!msg) return null;
      msg.replies.push({ ...reply, date: new Date() });
      await msg.save();
      return msg;
  },

  async addPhoto(id, photoUrl) {
      const msg = await gameChatModel.findById(id);
      if (!msg) return null;
      msg.photo = photoUrl;
      await msg.save();
      return msg;
  },

  async delete(id) {
      return await gameChatModel.findByIdAndDelete(id);
  },

  async isAuthor(messageId, userName) {
      const message = await gameChatModel.findById(messageId);
      return message && message.author === userName;
  },

  async update(id, updates) {
      updates.edited = true;
      updates.dateEdited = new Date();
      return await gameChatModel.findByIdAndUpdate(id, updates, { new: true });
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
