const MessageDao = require('../model/MessageDao');

const postMessage = async (req, res) => {
  const { message } = req.body;
  const user = req.session.user;

  try {
    const newMessage = await MessageDao.create({
      message,
      author: user.name,
      authorType: user.permission,
    });
    res.status(200).json({ success: true, newMessage });
  } catch (err) {
    res.status(500).json({ error: "Failed to post message", details: err.message });
  }
};

const viewMessages = async (req, res) => {
  try {
    const messages = await MessageDao.readAll();
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages", details: err.message });
  }
};

const deleteMessage = async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;

  try {
    const isAuthor = await MessageDao.isAuthor(id, user.name);
    if (!isAuthor) {
      return res.status(403).json({ error: "You are not authorized to delete this message." });
    }
    await MessageDao.delete(id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message", details: err.message });
  }
};

const updateMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const user = req.session.user;

  try {
    const isAuthor = await MessageDao.isAuthor(id, user.name);
    if (!isAuthor) {
      return res.status(403).json({ error: "You are not authorized to update this message." });
    }
    const updatedMessage = await MessageDao.update(id, { message });
    res.status(200).json({ success: true, updatedMessage });
  } catch (err) {
    res.status(500).json({ error: "Failed to update message", details: err.message });
  }
};

const addReply = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const user = req.session.user;

  try {
    const reply = {
      email: user.email,
      message,
    };
    const updatedMessage = await MessageDao.addReply(id, reply);
    if (updatedMessage) {
      res.status(200).json({ success: true, updatedMessage });
    } else {
      res.status(404).json({ error: "Message not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to add reply", details: err.message });
  }
};

const uploadPhoto = async (req, res) => {
  const user = req.session.user;

  try {
    const message = req.body.message || "(no message)";
    const photoUrl = `/uploads/${req.file.filename}`;

    const newMessage = await MessageDao.create({
      message,
      author: user.name,
      authorType: user.permission,
      photoUrl,
    });

    res.status(200).json({ success: true, newMessage });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload photo", details: err.message });
  }
};

const uploadVideo = async (req, res) => {
  const user = req.session.user;

  try {
    const message = req.body.message || "(no message)";
    const videoUrl = `/uploads/${req.file.filename}`;

    const newMessage = await MessageDao.create({
      message,
      author: user.name,
      authorType: user.permission,
      videoUrl,
    });

    res.status(200).json({ success: true, newMessage });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload video", details: err.message });
  }
};

module.exports = {
  postMessage,
  viewMessages,
  deleteMessage,
  updateMessage,
  addReply,
  uploadPhoto,
  uploadVideo,
};
