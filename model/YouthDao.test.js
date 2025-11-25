const dbcon = require('./DbConnect');
const youthDao = require('./YouthDao');
const userDao = require('./UserDao');
const { default: expect } = require('expect');
const mongoose = require('mongoose');

// Helper function to create a unique youth user
function createYouthUser(suffix = '') {
    return {
        name: `Youth${suffix}`,
        password: '123456',
        permission: 3,
        username: `youth${suffix}`
    };
}

// Helper function to create a unique adult user
function createAdultUser(suffix = '') {
    return {
        name: `Adult${suffix}`,
        email: `adult${suffix}@test.com`,
        password: '123456',
        permission: 1,
        username: `adult${suffix}`
    };
}

// Helper function to create a youth record structure
function createYouthRecord(userId, adultId, position = 'Running Back', teamId = null) {
    const record = {
        id_user: userId,
        position: position,
        dob: new Date('2010-05-15'),
        id_adult: adultId
    };
    
    if (teamId) {
        record.id_team = teamId;
    }
    
    return record;
}

beforeAll(async function(){ 
    await dbcon.connect('test');
});

afterAll(async function(){ 
    await youthDao.deleteAll();
    await userDao.deleteAll();
    dbcon.disconnect();
});

beforeEach(async function(){ 
    await youthDao.deleteAll();
    await userDao.deleteAll();
});

test('Create new youth test', async function(){
    let createdYouthUser = await userDao.create(createYouthUser());
    let createdAdultUser = await userDao.create(createAdultUser());
    
    let newYouth = createYouthRecord(createdYouthUser._id, createdAdultUser._id);
    let created = await youthDao.create(newYouth);
    
    expect(created._id).not.toBeNull();
    expect(created.position).toBe('Running Back');
    expect(created.id_user).toEqual(createdYouthUser._id);
    expect(created.id_adult).toEqual(createdAdultUser._id);
});

test('Delete Youth', async function(){
    let createdYouthUser = await userDao.create(createYouthUser());
    let createdAdultUser = await userDao.create(createAdultUser());
    
    let newYouth = createYouthRecord(createdYouthUser._id, createdAdultUser._id, 'Quarterback');
    let created = await youthDao.create(newYouth);
    let deleted = await youthDao.del(created._id);
    
    let youths = await youthDao.readAllYouth();
    let found = youths.find(y => y._id.equals(created._id));
    
    expect(found).toBeUndefined();
    expect(deleted._id).toEqual(created._id);
});

test('Read All Youths', async function(){
    let createdAdultUser = await userDao.create(createAdultUser());
    
    let youthUser1 = await userDao.create(createYouthUser('1'));
    let youthUser2 = await userDao.create(createYouthUser('2'));
    let youthUser3 = await userDao.create(createYouthUser('3'));
    
    await youthDao.create(createYouthRecord(youthUser1._id, createdAdultUser._id, 'Wide Receiver'));
    await youthDao.create(createYouthRecord(youthUser2._id, createdAdultUser._id, 'Linebacker'));
    await youthDao.create(createYouthRecord(youthUser3._id, createdAdultUser._id, 'Cornerback'));
    
    let allYouths = await youthDao.readAllYouth();
    
    expect(allYouths.length).toBe(3);
});

test('Update Youth', async function(){
    let youthUser = await userDao.create(createYouthUser());
    let adultUser = await userDao.create(createAdultUser());
    
    let created = await youthDao.create(createYouthRecord(youthUser._id, adultUser._id));
    
    let updates = { position: 'Fullback' };
    let updated = await youthDao.update(created._id, updates);
    
    expect(updated.position).toBe('Fullback');
    expect(updated._id).toEqual(created._id);
});

test('Find Youths by Adult ID', async function(){
    let adult = await userDao.create(createAdultUser('1'));
    let youthUser = await userDao.create(createYouthUser('1'));
    
    await youthDao.create(createYouthRecord(youthUser._id, adult._id, 'Safety'));
    
    let adultYouths = await youthDao.findByAdultId(adult._id);
    
    expect(adultYouths.length).toBe(1);
    expect(adultYouths[0].position).toBe('Safety');
});

test('Find Youths by User ID', async function(){
    let adult = await userDao.create(createAdultUser('1'));
    let youthUser = await userDao.create(createYouthUser('1'));
    
    await youthDao.create(createYouthRecord(youthUser._id, adult._id, 'Safety'));
    
    let youth = await youthDao.findByUserId(youthUser._id);
    
    expect(youth).not.toBeNull();
    expect(youth.position).toBe('Safety');
});

test('Check if Youth is Under Adult', async function(){
    let youthUser = await userDao.create(createYouthUser());
    let adult1 = await userDao.create(createAdultUser('1'));
    let adult2 = await userDao.create(createAdultUser('2'));
    
    let created = await youthDao.create(createYouthRecord(youthUser._id, adult1._id, 'Center'));
    
    let isUnderAdult1 = await youthDao.isYouthUnderAdult(created._id, adult1._id);
    let isUnderAdult2 = await youthDao.isYouthUnderAdult(created._id, adult2._id);
    
    expect(isUnderAdult1).toBe(true);
    expect(isUnderAdult2).toBe(false);
});

test('Read Youth by ID', async function(){
    let youthUser = await userDao.create(createYouthUser());
    let adultUser = await userDao.create(createAdultUser());
    
    let created = await youthDao.create(createYouthRecord(youthUser._id, adultUser._id, 'Tight End'));
    
    let found = await youthDao.read(created._id);
    
    expect(found).not.toBeNull();
    expect(found._id).toEqual(created._id);
    expect(found.position).toBe('Tight End');
});

test('Get Youths on Team', async function(){
    const teamId = new mongoose.Types.ObjectId();
    
    let adult = await userDao.create(createAdultUser());
    
    let youthUser1 = await userDao.create(createYouthUser('1'));
    let youthUser2 = await userDao.create(createYouthUser('2'));
    
    await youthDao.create(createYouthRecord(youthUser1._id, adult._id, 'Forward', teamId));
    await youthDao.create(createYouthRecord(youthUser2._id, adult._id, 'Guard', teamId));
    
    let teamYouths = await youthDao.getYouthOnTeam(teamId);
    
    expect(teamYouths.length).toBe(2);
});