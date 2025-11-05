// Comms.test.js
// Unit tests for Communications
// Loren Kim

const Comms = require('./Comms');
const MessageDao = require('../model/MessageDao');
const { cliLogin } = require('./UserController');

jest.mock('./UserController', () => ({
  cliLogin: jest.fn()
}));

jest.mock('../model/MessageDao', () => ({
  create: jest.fn(),
  readAll: jest.fn()
}));

const mockQuestion = jest.fn();
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: (query, callback) => {
      const answer = mockQuestion(query);
      callback(answer);
    },
    close: jest.fn()
  }))
}));

describe('Comms class tests', () => {
  let comms;

  beforeEach(() => {
    comms = new Comms();
    jest.clearAllMocks();
  });

  test('login() should call cliLogin with provided email and password', async () => {
    mockQuestion
      .mockReturnValueOnce('test@example.com') 
      .mockReturnValueOnce('password123'); 

    cliLogin.mockResolvedValue({ name: 'Loren Kim', permission: 'Admin' });

    await comms.login();

    expect(cliLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(comms.currentUser).toEqual({ name: 'Loren Kim', permission: 'Admin' });
  });

  test('postMessage() should prompt login if not logged in, then create a message', async () => {
    mockQuestion
      .mockReturnValueOnce('loren@example.com') 
      .mockReturnValueOnce('testpass')          
      .mockReturnValueOnce('This is a test message.'); 

    cliLogin.mockResolvedValue({ name: 'Loren Kim', permission: 'Member' });
    MessageDao.create.mockResolvedValue({ message: 'This is a test message.' });

    await comms.postMessage();

    expect(cliLogin).toHaveBeenCalled();
    expect(MessageDao.create).toHaveBeenCalledWith({
      message: 'This is a test message.',
      author: 'Loren Kim',
      authorType: 'Member'
    });
  });

  test('viewMessages() should print formatted messages and replies', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    MessageDao.readAll.mockResolvedValue([
      {
        message: 'Main message',
        author: 'Alice',
        dateCreated: new Date('2025-01-01'),
        replies: [
          {
            email: 'bob@example.com',
            message: 'Reply message',
            date: new Date('2025-01-02')
          }
        ]
      }
    ]);

    await comms.viewMessages();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Message Board/));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Alice: Main message/));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/↳ Reply 1 by bob@example.com/));

    consoleSpy.mockRestore();
  });

  test('viewMessages() should print "No messages." when database is empty', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    MessageDao.readAll.mockResolvedValue([]);

    await comms.viewMessages();

    expect(consoleSpy).toHaveBeenCalledWith('No messages.');
    consoleSpy.mockRestore();
  });
});
