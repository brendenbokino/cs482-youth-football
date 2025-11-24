const mongoose = require('mongoose');
const dbcon = require('./DbConnect'); 
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
        await dbcon.connect('test'); 
    });

    afterAll(async () => {
        await GameDao.deleteAll();
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        await GameDao.deleteAll(); 
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

    test('Read all games when no games exist', async () => {
        const allGames = await GameDao.readAll();
        expect(allGames.length).toBe(0);
    });

    test('Read a single game by ID', async () => {
        await GameDao.create(gameData);
        const game = await GameDao.read(gameId);

        expect(game._id).toBe(gameId);
        expect(game.team1).toBe('Bears');
    });

    test('Read a single game with invalid ID', async () => {
        const invalidId = 'invalid-id';
        await expect(GameDao.read(invalidId)).rejects.toThrow();
    });

    test('Read a single game with non-existent ID', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const game = await GameDao.read(nonExistentId);
        expect(game).toBeNull();
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

    test("Read all logs game read function", async () => {
        console.log = jest.fn();
        await GameDao.create(gameData);
        await GameDao.read(gameId);
    
        const allLogs = console.log.mock.calls.flat();

        let idLogFound = false;
        let teamsLogFound = false;
    
        for (const log of allLogs) {
            if (log.includes("GameDao.read: Game _id:")) {
                idLogFound = true;
                expect(log).toContain(gameId);
            }
            if (log.includes("GameDao.read: Game teams:")) {
                teamsLogFound = true;
                expect(log).toContain("Bears vs Lions");
            }
        }
    
        expect(idLogFound).toBe(true);
        expect(teamsLogFound).toBe(true);
    });

    test("update() should update a game and return the new one", async () => {
        const updatedGame = {
            _id: "123",
            teams: "Sharks vs Dolphins",
            score: "20-10"
        };
    
        GameDao.findByIdAndUpdate.mockResolvedValueOnce(updatedGame);
        const result = await GameDao.update("123", { score: "20-10" });
    
        expect(GameDao.findByIdAndUpdate).toHaveBeenCalledWith("123", { score: "20-10" }, { new: true });
        expect(result).toEqual(updatedGame);
    });
    

    test("update() should update a game in MongoDB", async () => {
        const game = await GameDao.create({
            team1: "Bears",
            team2: "Lions",
            date: new Date(),
            location: "Old Stadium"
        });

        const updated = await GameDao.update(game._id, {
            location: "New Stadium"
        });

        expect(updated).not.toBeNull();
        expect(updated.location).toBe("New Stadium");
    });

    test("update() should return null if game does not exist", async () => {
        const id = new mongoose.Types.ObjectId();
        const updated = await GameDao.update(id, { location: "Whatever" });

        expect(updated).toBeNull();
    });

    
    test("del() should delete a game and return it", async () => {
        const game = await GameDao.create({
            team1: "ravens",
            team2: "steelers",
            date: new Date(),
            location: "home"
        });

        const deleted = await GameDao.del(game._id);

        expect(deleted).not.toBeNull();
        expect(deleted._id.toString()).toBe(game._id.toString());

        const check = await GameDao.read(game._id);
        expect(check).toBeNull();
    });
    
});
