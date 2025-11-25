const mongoose = require('mongoose');
const dbcon = require('./DbConnect'); 
const GameDao = require('./GameDao');

const team1Id = new mongoose.Types.ObjectId();
const team2Id = new mongoose.Types.ObjectId();
const gameData = {
    id_team1: team1Id,
    id_team2: team2Id,
    date: new Date('2026-10-20T19:00:00Z'),
    location: 'MetLife Stadium',
    link: 'http://example.com/game/789',
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
        expect(created.id_team1.toString()).toBe(found.id_team1.toString());
        expect(created.location).toBe(found.location);
    });

    test('Read all games', async () => {
        await GameDao.create(gameData);
        const team3Id = new mongoose.Types.ObjectId();
        const team4Id = new mongoose.Types.ObjectId();
        await GameDao.create({ id_team1: team3Id, id_team2: team4Id, date: new Date('2026-10-27T19:00:00Z'), location: 'Philly Arena'});

        const allGames = await GameDao.readAll();

        expect(allGames.length).toBe(2);
        expect(allGames[0].id_team1.toString()).toBe(team1Id.toString());
        expect(allGames[1].id_team1.toString()).toBe(team3Id.toString());
    });

    test('Read all games when no games exist', async () => {
        const allGames = await GameDao.readAll();
        expect(allGames.length).toBe(0);
    });

    test('Read a single game by ID', async () => {
        const created = await GameDao.create(gameData);
        const game = await GameDao.read(created._id);

        expect(game._id.toString()).toBe(created._id.toString());
        expect(game.id_team1.toString()).toBe(team1Id.toString());
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
        const created = await GameDao.create(gameData);

        const updateObj = { location: 'New Stadium', date: new Date('2026-10-21T19:00:00Z') };
        const updatedGame = await GameDao.update(created._id, updateObj);

        expect(updatedGame.location).toBe('New Stadium');
        expect(new Date(updatedGame.date)).toEqual(updateObj.date);
    });

    test('Delete a single game by ID', async () => {
        const created = await GameDao.create(gameData);

        const deleted = await GameDao.del(created._id);
        const found = await GameDao.read(created._id);

        expect(found).toBeNull();
        expect(deleted._id.toString()).toBe(created._id.toString());
    });

    test('Delete all games', async () => {
        await GameDao.create(gameData);
        const team3Id = new mongoose.Types.ObjectId();
        const team4Id = new mongoose.Types.ObjectId();
        await GameDao.create({ id_team1: team3Id, id_team2: team4Id, date: new Date('2026-10-27T19:00:00Z'), location: 'Philly Arena' });

        await GameDao.deleteAll();
        const allGames = await GameDao.readAll();

        expect(allGames.length).toBe(0);
    });

    test("update() should update a game in MongoDB", async () => {
        const testTeam1 = new mongoose.Types.ObjectId();
        const testTeam2 = new mongoose.Types.ObjectId();
        const game = await GameDao.create({
            id_team1: testTeam1,
            id_team2: testTeam2,
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
        const testTeam1 = new mongoose.Types.ObjectId();
        const testTeam2 = new mongoose.Types.ObjectId();
        const game = await GameDao.create({
            id_team1: testTeam1,
            id_team2: testTeam2,
            date: new Date(),
            location: "home"
        });

        const deleted = await GameDao.del(game._id);

        expect(deleted).not.toBeNull();
        expect(deleted._id.toString()).toBe(game._id.toString());

        const check = await GameDao.read(game._id);
        expect(check).toBeNull();
    });

    test("create() should throw error when validation fails", async () => {
        // Missing required fields id_team1 and id_team2
        const invalidGame = {
            date: new Date(),
            location: "Stadium"
        };

        await expect(GameDao.create(invalidGame)).rejects.toThrow();
    });
    
});
