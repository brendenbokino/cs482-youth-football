
const GameDao = require('./GameDao');

// Mock TeamDao before requiring TeamController
jest.mock('./GameDao', () => ({
    create: jest.fn(),
    readAll: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
    deleteAll: jest.fn()
}));



// // a game should have 2 teams, a date for when it will occur, a location for where it will occur & then some meta data 
// const gameSchema = new mongoose.Schema({
//     team1: String,
//     team2: String,
//     date: Date, /// date type to make sorting easier 
//     location: String,
//     link: String,
//     _id: String
// });


// Mock Data
const gameId = 'game789';
const gameData = {
    team1: 'Bears',
    team2: 'Lions',
    date: new Date('2026-10-20T19:00:00Z'),
    location: 'MetLife Stadium',
    link: 'http://example.com/game/789',
    _id: gameId
};

const updatedGameData = {
    ...gameData,
    location: 'New Stadium',
    date: new Date('2026-10-21T19:00:00Z')
};

const gameList = [
    gameData,
    { team1: 'Giants', team2: 'Eagles', date: new Date('2026-10-27T19:00:00Z'), location: 'Philly Arena', _id: 'game101' }
];

describe('GameDAO Mock Tests', () => {
    // Clears the mock history
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Create Test ---
    test('Create new game', async function() {
        // Setup mock return value
        GameDao.create.mockResolvedValue(gameData);

        // Execute
        let game = await GameDao.create(gameData);
    
        // Assertions
        expect(GameDao.create).toHaveBeenCalledTimes(1);
        expect(GameDao.create).toHaveBeenCalledWith(gameData);
        expect(game).toEqual(gameData);
    });

    // --- Read All Test ---
    test('Read all games', async function() {
        // Setup mock return value
        GameDao.readAll.mockResolvedValue(gameList);

        // Execute
        let games = await GameDao.readAll();
    
        // Assertions
        expect(GameDao.readAll).toHaveBeenCalledTimes(1);
        expect(games).toEqual(gameList);
        expect(games.length).toBe(2);
    });

    // --- Read Single Test ---
    test('Read a single game by ID', async function() {
        // Setup mock return value
        GameDao.read.mockResolvedValue(gameData);

        // Execute
        let game = await GameDao.read(gameId);
    
        // Assertions
        expect(GameDao.read).toHaveBeenCalledTimes(1);
        expect(GameDao.read).toHaveBeenCalledWith(gameId);
        expect(game).toEqual(gameData);
    });

    // --- Update Test ---
    test('Update an existing game', async function() {
        // Define the partial update object
        const updateObject = { location: 'New Stadium', date: new Date('2026-10-21T19:00:00Z') };

        // Setup mock return value (often returns the updated document)
        GameDao.update.mockResolvedValue(updatedGameData);

        // Execute
        let updatedGame = await GameDao.update(gameId, updateObject);
    
        // Assertions
        expect(GameDao.update).toHaveBeenCalledTimes(1);
        // Check if it was called with the correct ID and the update object
        expect(GameDao.update).toHaveBeenCalledWith(gameId, updateObject);
        expect(updatedGame).toEqual(updatedGameData);
    });

    // --- Delete Single Test ---
    test('Delete a single game by ID', async function() {
        // Setup mock return value (e.g., confirmation object or the deleted document)
        GameDao.del.mockResolvedValue({ deletedCount: 1 });

        // Execute
        let result = await GameDao.del(gameId);
    
        // Assertions
        expect(GameDao.del).toHaveBeenCalledTimes(1);
        expect(GameDao.del).toHaveBeenCalledWith(gameId);
        expect(result).toEqual({ deletedCount: 1 });
    });

    // --- Delete All Test ---
    test('Delete all games', async function() {
        // Setup mock return value
        GameDao.deleteAll.mockResolvedValue({ deletedCount: 5 }); // Assuming 5 were deleted

        // Execute
        let result = await GameDao.deleteAll();
    
        // Assertions
        expect(GameDao.deleteAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ deletedCount: 5 });
    });
});
