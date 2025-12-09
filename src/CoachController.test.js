const CoachController = require('./CoachController');
const UserDao = require('../model/UserDao');

jest.mock('../model/UserDao');

describe('CoachController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createAccount', () => {
    it('should create a coach account successfully', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        password: 'password123',
        username: 'johndoe',
        permission: '1',
      };

      await CoachController.createAccount(req, res);

      expect(UserDao.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        password: 'password123',
        username: 'johndoe',
        permission: 1,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Coach account created.',
        coach: expect.any(Object),
      });
    });

    it('should handle errors when creating a coach account', async () => {
      UserDao.create.mockRejectedValue(new Error('Database error'));

      await CoachController.createAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to create coach account',
        details: 'Database error',
      });
    });
  });

  describe('viewAccount', () => {
    it('should retrieve account information successfully', async () => {
      req.body = { email: 'john@example.com' };
      UserDao.findLogin.mockResolvedValue({ name: 'John Doe', email: 'john@example.com' });

      await CoachController.viewAccount(req, res);

      expect(UserDao.findLogin).toHaveBeenCalledWith('john@example.com');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Account Info',
        user: expect.any(Object),
      });
    });

    it('should return 404 if account is not found', async () => {
      UserDao.findLogin.mockResolvedValue(null);

      await CoachController.viewAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });

    it('should handle errors when retrieving account information', async () => {
      UserDao.findLogin.mockRejectedValue(new Error('Database error'));

      await CoachController.viewAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to retrieve account',
        details: 'Database error',
      });
    });
  });

  describe('updateAccount', () => {
    it('should update account information successfully', async () => {
      req.body = { email: 'john@example.com', field: 'phone', value: '0987654321' };
      UserDao.findLogin.mockResolvedValue({ _id: 'user123', email: 'john@example.com' });
      UserDao.update.mockResolvedValue({ _id: 'user123', phone: '0987654321' });

      await CoachController.updateAccount(req, res);

      expect(UserDao.findLogin).toHaveBeenCalledWith('john@example.com');
      expect(UserDao.update).toHaveBeenCalledWith('user123', { phone: '0987654321' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Account updated',
        updatedUser: expect.any(Object),
      });
    });

    it('should return 404 if account is not found', async () => {
      UserDao.findLogin.mockResolvedValue(null);

      await CoachController.updateAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });

    it('should handle errors when updating account information', async () => {
      UserDao.findLogin.mockRejectedValue(new Error('Database error'));

      await CoachController.updateAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to update account',
        details: 'Database error',
      });
    });
  });

  describe('deleteAccount', () => {
    it('should delete an account successfully', async () => {
      req.body = { email: 'john@example.com' };
      UserDao.findLogin.mockResolvedValue({ _id: 'user123', email: 'john@example.com' });
      UserDao.del.mockResolvedValue();

      await CoachController.deleteAccount(req, res);

      expect(UserDao.findLogin).toHaveBeenCalledWith('john@example.com');
      expect(UserDao.del).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account deleted' });
    });

    it('should return 404 if account is not found', async () => {
      UserDao.findLogin.mockResolvedValue(null);

      await CoachController.deleteAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });

    it('should handle errors when deleting an account', async () => {
      UserDao.findLogin.mockRejectedValue(new Error('Database error'));

      await CoachController.deleteAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to delete account',
        details: 'Database error',
      });
    });
  });
});
