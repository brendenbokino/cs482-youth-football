const mongoose = require('mongoose');
const dbcon = require('./DbConnect'); // your DB connection module
const GameDao = require('./GameDao');

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

describe('GameDao Integration Tests', () => {
    beforeAll(async () => {
        await dbcon.connect('test'); // connect to test DB
    });

    afterAll(async () => {
        await GameDao.deleteAll();
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        await GameDao.deleteAll(); // clear DB before each test
    });

    test('Create new game', async () => {
        const created = await GameDao.create(gameData);
        const found = await GameDao.read(created._id);

        expect(created._id).not.toBeNull();
        expect(created.team1).toBe(found.team1);
        expect(created.location).toBe(found.location);
    });

    test('Read all games', async () => {
        await GameDao.create(gameData);
        await GameDao.create({ team1: 'Giants', team2: 'Eagles', date: new Date('2026-10-27T19:00:00Z'), location: 'Philly Arena', _id: 'game101' });

        const allGames = await GameDao.readAll();

        expect(allGames.length).toBe(2);
        expect(allGames[0].team1).toBe('Bears');
        expect(allGames[1].team1).toBe('Giants');
    });
    
    test('Read a single game by ID', async () => {
        await GameDao.create(gameData);
        const game = await GameDao.read(gameId);

        expect(game._id).toBe(gameId);
        expect(game.team1).toBe('Bears');
    });

    test('Update an existing game', async () => {
        await GameDao.create(gameData);

        const updateObj = { location: 'New Stadium', date: new Date('2026-10-21T19:00:00Z') };
        const updatedGame = await GameDao.update(gameId, updateObj);

        expect(updatedGame.location).toBe('New Stadium');
        expect(new Date(updatedGame.date)).toEqual(updateObj.date);
    });


    test('Delete a single game by ID', async () => {
        await GameDao.create(gameData);

        const deleted = await GameDao.del(gameId);
        const found = await GameDao.read(gameId);

        expect(found).toBeNull();
        expect(deleted._id).toBe(gameId);
    });

    test('Delete all games', async () => {
        await GameDao.create(gameData);
        await GameDao.create({ team1: 'Giants', team2: 'Eagles', date: new Date('2026-10-27T19:00:00Z'), location: 'Philly Arena', _id: 'game101' });

        await GameDao.deleteAll();
        const allGames = await GameDao.readAll();

        expect(allGames.length).toBe(0);
    });
});
