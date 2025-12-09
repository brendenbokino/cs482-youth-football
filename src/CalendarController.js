const GameChatDao = require('../model/GameChatDao');

const CalendarController = {
  async postMessage(req, res) {
    const { message, gameId } = req.body;
    const user = req.session.user;

    try {
      const newMessage = await GameChatDao.create({
        message,
        gameId,
        author: user.name,
        authorType: user.permission,
      });
      res.status(200).json({ success: true, newMessage });
    } catch (err) {
      res.status(500).json({ error: "Failed to post message", details: err.message });
    }
  },

  async viewMessages(req, res) {
    const { gameId } = req.query;

    try {
      const messages = await GameChatDao.readByGameId(gameId);
      res.json({ messages });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch messages", details: err.message });
    }
  },

  async deleteMessage(req, res) {
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
  },

  async updateMessage(req, res) {
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
  },

  async addReply(req, res) {
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
  },
};

module.exports = CalendarController;
