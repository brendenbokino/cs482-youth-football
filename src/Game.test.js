// Reece Watkins game test 



// Mock GameDao before requiring GameController
jest.mock('../model/GameDao.js', () => ({
    create: jest.fn(),
    readAll: jest.fn(),
    read: jest.fn(),
    del: jest.fn(),
    deleteAll: jest.fn()
}));

const GameController = require('./GameController.js');
const gameDao = require('../model/GameDao.js');



describe('Game Controller Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("createNewGame with valid data", async function() {
        const game = new GameController();

        // Mock successful database creation
        const mockSavedGame = {
            _id: '507f1f77bcf86cd799439011',
            team1: 'Bears',
            team2: 'Goats',
            date: Date('Oct-20-2025'),
            location: 'Metlife'
        };

        const req = {
            team1: 'Bears',
            team2: 'Goats',
            date: Date('Oct-20-2025'),
            location: 'Metlife'
        };

        let res = {
            status: 0,
            send: {},
            error: ""
        };

        gameDao.create.mockResolvedValue(mockSavedGame);

        await game.createNewGame(req, res);

        expect(res.error).toBe("");
        expect(res.status).toBe(200);
        expect(game.gameData.team1).toBe("Bears");
        expect(game.gameData.team2).toBe("Goats");
    });

    test("createNewGame with missing team1", async function() {
        const game = new GameController();
        
        const req = {
            team1: null,
            team2: 'Goats',
            date: new Date('Oct-20-2025'),
            location: 'Metlife'
        };

        let res = {
            status: 0,
            send: {},
            error: ""
        };

        await game.createNewGame(req, res);

        expect(res.send.error).toBe("There must be at least 2 teams in order to create a game");
        expect(res.status).toBe(400);
    });

    test("createNewGame with missing team2", async function() {
        const game = new GameController();
        
        const req = {
            team1: "Bears",
            team2: null,
            date: 'Oct-20-2025',
            location: 'Metlife'
        };

        let res = {
            status: 0,
            send: {}
        };

        await game.createNewGame(req, res);

        expect(res.send.error).toBe("There must be at least 2 teams in order to create a game");
        expect(res.status).toBe(400);
    });

    test("createNewGame with null request", async function() {
        const game = new GameController();
        
        let res = {
            status: 0,
            send: {},
            
        };

        await game.createNewGame(null, res);

        expect(res.send.error).toBe("Request is empty");
        expect(res.status).toBe(400);
    });

    test("getAllGames", async function() {
        const game = new GameController();
        
        const mockGames = [
            { _id: '1', team1: 'Bears', team2: 'Goats', date: 'Oct-20-2025', location: 'Metlife' },
            { _id: '2', team1: 'Eagles', team2: 'Hawks', date: 'Oct-21-2025', location: 'Central Field' }
        ];

        let res = {
            status: 0,
            send: {}
        };

        gameDao.readAll.mockResolvedValue(mockGames);
        

        await game.getAllGames({}, res);

        expect(res.status).toBe(200);
        expect(res.send).toEqual(mockGames);
    });

    test("deleteAllGames", async function() {
        const game = new GameController();
        
        let res = {
            status: 0,
            send: {}
        };

        gameDao.deleteAll.mockResolvedValue();

        await game.deleteAllGames({}, res);

        expect(res.status).toBe(200);
        expect(res.send.success).toBe(true);
    });

    
});




