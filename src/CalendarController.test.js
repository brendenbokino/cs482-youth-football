const CalendarController = require('./CalendarController');
const GameChatDao = require('../model/GameChatDao');

jest.mock('../model/GameChatDao');

describe('CalendarController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      session: { user: { name: 'testUser', permission: 'user', email: 'test@example.com' } },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('postMessage', () => {
    it('should post a new message successfully', async () => {
      req.body = { message: 'Hello', gameId: 'game123' };
      GameChatDao.create.mockResolvedValue({ id: 'msg1', ...req.body, author: 'testUser', authorType: 'user' });

      await CalendarController.postMessage(req, res);

      expect(GameChatDao.create).toHaveBeenCalledWith({
        message: 'Hello',
        gameId: 'game123',
        author: 'testUser',
        authorType: 'user',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, newMessage: expect.any(Object) });
    });

    it('should handle errors when posting a message', async () => {
      GameChatDao.create.mockRejectedValue(new Error('Database error'));

      await CalendarController.postMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to post message', details: 'Database error' });
    });
  });

  describe('viewMessages', () => {
    it('should fetch messages successfully', async () => {
      req.query = { gameId: 'game123' };
      GameChatDao.readByGameId.mockResolvedValue([{ id: 'msg1', message: 'Hello' }]);

      await CalendarController.viewMessages(req, res);

      expect(GameChatDao.readByGameId).toHaveBeenCalledWith('game123');
      expect(res.json).toHaveBeenCalledWith({ messages: expect.any(Array) });
    });

    it('should handle errors when fetching messages', async () => {
      GameChatDao.readByGameId.mockRejectedValue(new Error('Database error'));

      await CalendarController.viewMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch messages', details: 'Database error' });
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message successfully if user is the author', async () => {
      req.params = { id: 'msg1' };
      GameChatDao.isAuthor.mockResolvedValue(true);
      GameChatDao.delete.mockResolvedValue();

      await CalendarController.deleteMessage(req, res);

      expect(GameChatDao.isAuthor).toHaveBeenCalledWith('msg1', 'testUser');
      expect(GameChatDao.delete).toHaveBeenCalledWith('msg1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 403 if user is not the author', async () => {
      GameChatDao.isAuthor.mockResolvedValue(false);

      await CalendarController.deleteMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'You are not authorized to delete this message.' });
    });

    it('should handle errors when deleting a message', async () => {
      GameChatDao.isAuthor.mockRejectedValue(new Error('Database error'));

      await CalendarController.deleteMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete message', details: 'Database error' });
    });
  });

  describe('updateMessage', () => {
    it('should update a message successfully if user is the author', async () => {
      req.params = { id: 'msg1' };
      req.body = { message: 'Updated message' };
      GameChatDao.isAuthor.mockResolvedValue(true);
      GameChatDao.update.mockResolvedValue({ id: 'msg1', message: 'Updated message' });

      await CalendarController.updateMessage(req, res);

      expect(GameChatDao.isAuthor).toHaveBeenCalledWith('msg1', 'testUser');
      expect(GameChatDao.update).toHaveBeenCalledWith('msg1', { message: 'Updated message' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, updatedMessage: expect.any(Object) });
    });

    it('should return 403 if user is not the author', async () => {
      GameChatDao.isAuthor.mockResolvedValue(false);

      await CalendarController.updateMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'You are not authorized to update this message.' });
    });

    it('should handle errors when updating a message', async () => {
      GameChatDao.isAuthor.mockRejectedValue(new Error('Database error'));

      await CalendarController.updateMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update message', details: 'Database error' });
    });
  });

  describe('addReply', () => {
    it('should add a reply to a message successfully', async () => {
      req.params = { id: 'msg1' };
      req.body = { message: 'Reply message' };
      GameChatDao.addReply.mockResolvedValue({ id: 'msg1', replies: [{ email: 'test@example.com', message: 'Reply message' }] });

      await CalendarController.addReply(req, res);

      expect(GameChatDao.addReply).toHaveBeenCalledWith('msg1', { email: 'test@example.com', message: 'Reply message' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, updatedMessage: expect.any(Object) });
    });

    it('should return 404 if message is not found', async () => {
      GameChatDao.addReply.mockResolvedValue(null);

      await CalendarController.addReply(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Message not found.' });
    });

    it('should handle errors when adding a reply', async () => {
      GameChatDao.addReply.mockRejectedValue(new Error('Database error'));

      await CalendarController.addReply(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to add reply', details: 'Database error' });
    });
  });
});
