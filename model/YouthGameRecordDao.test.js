const dbcon = require('./DbConnect');
const ygrDao = require('./YouthGameRecordDao');
const mongoose = require('mongoose');

beforeAll(async function(){ 
    await dbcon.connect('test');
});

afterAll(async function(){ 
    await ygrDao.deleteAll();
    dbcon.disconnect();
});

beforeEach(async function(){ 
    await ygrDao.deleteAll();
});

test('Create new youth game record', async function(){
    const mockGameId = new mongoose.Types.ObjectId();
    const mockYouthId = new mongoose.Types.ObjectId();
    
    let recordData = {
        id_game: mockGameId,
        id_youth: mockYouthId,
    };
    
    let createdRecord = await ygrDao.create(recordData);
    
    expect(createdRecord._id).not.toBeNull();
    expect(createdRecord.id_game).toEqual(mockGameId);
    expect(createdRecord.id_youth).toEqual(mockYouthId);
});

test('Delete youth game record', async function(){
    const mockGameId = new mongoose.Types.ObjectId();
    const mockYouthId = new mongoose.Types.ObjectId();
    
    let recordData = {
        id_game: mockGameId,
        id_youth: mockYouthId,
    };
    
    let record = await ygrDao.create(recordData);
    let deleted = await ygrDao.del(record._id);
    let found = await ygrDao.read(record._id);
    
    expect(found).toBeNull();
    expect(deleted._id).toEqual(record._id);
});

test('Read all youth game records', async function(){
    const mockGame1Id = new mongoose.Types.ObjectId();
    const mockGame2Id = new mongoose.Types.ObjectId();
    const mockYouth1Id = new mongoose.Types.ObjectId();
    const mockYouth2Id = new mongoose.Types.ObjectId();
    
    await ygrDao.create({
        id_game: mockGame1Id,
        id_youth: mockYouth1Id,
    });
    await ygrDao.create({
        id_game: mockGame2Id,
        id_youth: mockYouth2Id,
    });
    await ygrDao.create({
        id_game: mockGame1Id,
        id_youth: mockYouth2Id,
    });
    
    let allRecords = await ygrDao.readAll();
    
    expect(allRecords.length).toBe(3);
});

test('Read youth game record by ID', async function(){
    const mockGameId = new mongoose.Types.ObjectId();
    const mockYouthId = new mongoose.Types.ObjectId();
    
    let recordData = {
        id_game: mockGameId,
        id_youth: mockYouthId,
    };
    
    let createdRecord = await ygrDao.create(recordData);
    let foundRecord = await ygrDao.read(createdRecord._id);
    
    expect(foundRecord).not.toBeNull();
    expect(foundRecord._id).toEqual(createdRecord._id);
});

test('Update youth game record', async function(){
    const mockGameId = new mongoose.Types.ObjectId();
    const mockYouthId = new mongoose.Types.ObjectId();
    
    let recordData = {
        id_game: mockGameId,
        id_youth: mockYouthId,
    };
    
    let record = await ygrDao.create(recordData);
    let updated = await ygrDao.update(record._id, { 
        tackles: 5,
    });
    
    expect(updated.tackles).toBe(5);
});

test('Update returns null for non-existent record', async function(){
    const fakeId = new mongoose.Types.ObjectId();
    let updated = await ygrDao.update(fakeId, { rushing_yards: 100 });
    
    expect(updated).toBeNull();
});

test('Get game records by game ID', async function(){
    const mockGameId = new mongoose.Types.ObjectId();
    const mockYouth1Id = new mongoose.Types.ObjectId();
    const mockYouth2Id = new mongoose.Types.ObjectId();
    const mockYouth3Id = new mongoose.Types.ObjectId();
    
    await ygrDao.create({
        id_game: mockGameId,
        id_youth: mockYouth1Id,
    });
    await ygrDao.create({
        id_game: mockGameId,
        id_youth: mockYouth2Id,
    });
    await ygrDao.create({
        id_game: mockGameId,
        id_youth: mockYouth3Id,
    });
    
    let gameRecords = await ygrDao.getGameRecords(mockGameId);
    
    expect(gameRecords.length).toBe(3);
    expect(gameRecords[0].id_game).toEqual(mockGameId);
    expect(gameRecords[1].id_game).toEqual(mockGameId);
    expect(gameRecords[2].id_game).toEqual(mockGameId);
});

test('Get youth records by youth ID', async function(){
    const mockGame1Id = new mongoose.Types.ObjectId();
    const mockGame2Id = new mongoose.Types.ObjectId();
    const mockGame3Id = new mongoose.Types.ObjectId();
    const mockYouthId = new mongoose.Types.ObjectId();
    
    await ygrDao.create({
        id_game: mockGame1Id,
        id_youth: mockYouthId,
    });
    await ygrDao.create({
        id_game: mockGame2Id,
        id_youth: mockYouthId,
    });
    await ygrDao.create({
        id_game: mockGame3Id,
        id_youth: mockYouthId,
    });
    
    let youthRecords = await ygrDao.getYouthRecords(mockYouthId);
    
    expect(youthRecords.length).toBe(3);
    expect(youthRecords[0].id_youth).toEqual(mockYouthId);
    expect(youthRecords[1].id_youth).toEqual(mockYouthId);
    expect(youthRecords[2].id_youth).toEqual(mockYouthId);
});

test('Get youth record for specific game', async function(){
    const mockGameId = new mongoose.Types.ObjectId();
    const mockYouthId = new mongoose.Types.ObjectId();
    const mockOtherYouthId = new mongoose.Types.ObjectId();
    
    await ygrDao.create({
        id_game: mockGameId,
        id_youth: mockYouthId,
    });
    await ygrDao.create({
        id_game: mockGameId,
        id_youth: mockOtherYouthId,
    });
    
    let record = await ygrDao.getYouthRecordForGame(mockYouthId, mockGameId);
    
    expect(record).not.toBeNull();
    expect(record.id_youth).toEqual(mockYouthId);
    expect(record.id_game).toEqual(mockGameId);
});

test('Get youth record for game returns null when not found', async function(){
    const mockGameId = new mongoose.Types.ObjectId();
    const mockYouthId = new mongoose.Types.ObjectId();
    
    let record = await ygrDao.getYouthRecordForGame(mockYouthId, mockGameId);
    
    expect(record).toBeNull();
});

test('Delete all youth game records', async function(){
    const mockGameId = new mongoose.Types.ObjectId();
    const mockYouth1Id = new mongoose.Types.ObjectId();
    const mockYouth2Id = new mongoose.Types.ObjectId();
    
    await ygrDao.create({
        id_game: mockGameId,
        id_youth: mockYouth1Id,
    });
    await ygrDao.create({
        id_game: mockGameId,
        id_youth: mockYouth2Id,
    });
    
    let recordsBefore = await ygrDao.readAll();
    expect(recordsBefore.length).toBe(2);
    
    await ygrDao.deleteAll();
    
    let recordsAfter = await ygrDao.readAll();
    expect(recordsAfter.length).toBe(0);
});

