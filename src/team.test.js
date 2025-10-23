
// Reeec Watkins team tests 

// Mock GameDao before requiring GameController
jest.mock('../model/GameDao.js', () => ({
    create: jest.fn(),
    readAll: jest.fn(),
    read: jest.fn(),
    del: jest.fn(),
    deleteAll: jest.fn()
}));

const GameController = require('./TeamController.js');
const gameDao = require('../model/TeamDao.js');


