const CommsController = require('./CommsController');
const MessageDao = require('../model/MessageDao');

jest.mock('../model/MessageDao');

describe('CommsController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      session: { user: { name: 'testUser', permission: 'user', email: 'test@example.com' } },
      file: { filename: 'testfile.jpg' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('postMessage', () => {
    it('should post a new message successfully', async () => {
      req.body = { message: 'Hello' };
      MessageDao.create.mockResolvedValue({ id: 'msg1', ...req.body, author: 'testUser', authorType: 'user' });

      await CommsController.postMessage(req, res);

      expect(MessageDao.create).toHaveBeenCalledWith({
        message: 'Hello',
        author: 'testUser',
        authorType: 'user',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, newMessage: expect.any(Object) });
    });

    it('should handle errors when posting a message', async () => {
      MessageDao.create.mockRejectedValue(new Error('Database error'));

      await CommsController.postMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to post message', details: 'Database error' });
    });
  });

  describe('viewMessages', () => {
    it('should fetch all messages successfully', async () => {
      MessageDao.readAll.mockResolvedValue([{ id: 'msg1', message: 'Hello' }]);

      await CommsController.viewMessages(req, res);

      expect(MessageDao.readAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ messages: expect.any(Array) });
    });

    it('should handle errors when fetching messages', async () => {
      MessageDao.readAll.mockRejectedValue(new Error('Database error'));

      await CommsController.viewMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch messages', details: 'Database error' });
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message successfully if user is the author', async () => {
      req.params = { id: 'msg1' };
      MessageDao.isAuthor.mockResolvedValue(true);
      MessageDao.delete.mockResolvedValue();

      await CommsController.deleteMessage(req, res);

      expect(MessageDao.isAuthor).toHaveBeenCalledWith('msg1', 'testUser');
      expect(MessageDao.delete).toHaveBeenCalledWith('msg1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 403 if user is not the author', async () => {
      MessageDao.isAuthor.mockResolvedValue(false);

      await CommsController.deleteMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'You are not authorized to delete this message.' });
    });

    it('should handle errors when deleting a message', async () => {
      MessageDao.isAuthor.mockRejectedValue(new Error('Database error'));

      await CommsController.deleteMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete message', details: 'Database error' });
    });
  });

  describe('updateMessage', () => {
    it('should update a message successfully if user is the author', async () => {
      req.params = { id: 'msg1' };
      req.body = { message: 'Updated message' };
      MessageDao.isAuthor.mockResolvedValue(true);
      MessageDao.update.mockResolvedValue({ id: 'msg1', message: 'Updated message' });

      await CommsController.updateMessage(req, res);

      expect(MessageDao.isAuthor).toHaveBeenCalledWith('msg1', 'testUser');
      expect(MessageDao.update).toHaveBeenCalledWith('msg1', { message: 'Updated message' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, updatedMessage: expect.any(Object) });
    });

    it('should return 403 if user is not the author', async () => {
      MessageDao.isAuthor.mockResolvedValue(false);

      await CommsController.updateMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'You are not authorized to update this message.' });
    });

    it('should handle errors when updating a message', async () => {
      MessageDao.isAuthor.mockRejectedValue(new Error('Database error'));

      await CommsController.updateMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update message', details: 'Database error' });
    });
  });

  describe('addReply', () => {
    it('should add a reply to a message successfully', async () => {
      req.params = { id: 'msg1' };
      req.body = { message: 'Reply message' };
      MessageDao.addReply.mockResolvedValue({ id: 'msg1', replies: [{ email: 'test@example.com', message: 'Reply message' }] });

      await CommsController.addReply(req, res);

      expect(MessageDao.addReply).toHaveBeenCalledWith('msg1', { email: 'test@example.com', message: 'Reply message' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, updatedMessage: expect.any(Object) });
    });

    it('should return 404 if message is not found', async () => {
      MessageDao.addReply.mockResolvedValue(null);

      await CommsController.addReply(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Message not found.' });
    });

    it('should handle errors when adding a reply', async () => {
      MessageDao.addReply.mockRejectedValue(new Error('Database error'));

      await CommsController.addReply(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to add reply', details: 'Database error' });
    });
  });

  describe('uploadPhoto', () => {
    it('should upload a photo successfully', async () => {
      req.body = { message: 'Photo message' };
      MessageDao.create.mockResolvedValue({ id: 'msg1', message: 'Photo message', photoUrl: '/uploads/testfile.jpg' });

      await CommsController.uploadPhoto(req, res);

      expect(MessageDao.create).toHaveBeenCalledWith({
        message: 'Photo message',
        author: 'testUser',
        authorType: 'user',
        photoUrl: '/uploads/testfile.jpg',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, newMessage: expect.any(Object) });
    });

    it('should handle errors when uploading a photo', async () => {
      MessageDao.create.mockRejectedValue(new Error('Database error'));

      await CommsController.uploadPhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to upload photo', details: 'Database error' });
    });
  });

  describe('uploadVideo', () => {
    it('should upload a video successfully', async () => {
      req.body = { message: 'Video message' };
      MessageDao.create.mockResolvedValue({ id: 'msg1', message: 'Video message', videoUrl: '/uploads/testfile.jpg' });

      await CommsController.uploadVideo(req, res);

      expect(MessageDao.create).toHaveBeenCalledWith({
        message: 'Video message',
        author: 'testUser',
        authorType: 'user',
        videoUrl: '/uploads/testfile.jpg',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, newMessage: expect.any(Object) });
    });

    it('should handle errors when uploading a video', async () => {
      MessageDao.create.mockRejectedValue(new Error('Database error'));

      await CommsController.uploadVideo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to upload video', details: 'Database error' });
    });
  });
});
