const dbcon = require('./DbConnect');
const youthDao = require('./YouthDao');
const userDao = require('./UserDao');

beforeAll(async function(){ 
    await dbcon.connect('test');
});

afterAll(async function(){ 
    await youthDao.deleteAll();
    await userDao.deleteAll();
    dbcon.disconnect();
});

beforeEach(async function(){ 
    // Clean up youths before each test
    let youths = await youthDao.readAllYouth();
    for (let youth of youths) {
        await youthDao.del(youth._id);
    }
    // Clean up users before each test
    await userDao.deleteAll();
});

test('Create new youth test', async function(){
    // First create a user (youth) and an adult
    let youthUserData = {
        name: 'Youth Test',
        email: 'youth@test.com',
        password: '123456',
        permission: 3,
        username: 'youthuser',
        phone: '1234567890'
    };
    let adultUserData = {
        name: 'Adult Test',
        email: 'adult@test.com',
        password: '123456',
        permission: 1,
        username: 'adultuser',
        phone: '0987654321'
    };
    
    let createdYouthUser = await userDao.create(youthUserData);
    let createdAdultUser = await userDao.create(adultUserData);
    
    // Now create the youth record
    let newYouth = {
        id_user: createdYouthUser._id,
        position: 'Running Back',
        dob: new Date('2010-05-15'),
        id_adult: createdAdultUser._id
    };
    
    let created = await youthDao.create(newYouth);
    
    // Assertions
    expect(created._id).not.toBeNull();
    expect(created.position).toBe('Running Back');
    expect(created.id_user).toEqual(createdYouthUser._id);
    expect(created.id_adult).toEqual(createdAdultUser._id);
});

test('Delete Youth', async function(){
    // Create users first
    let youthUserData = {
        name: 'Youth Test',
        email: 'youth@test.com',
        password: '123456',
        permission: 3,
        username: 'youthuser',
        phone: '1234567890'
    };
    let adultUserData = {
        name: 'Adult Test',
        email: 'adult@test.com',
        password: '123456',
        permission: 1,
        username: 'adultuser',
        phone: '0987654321'
    };
    
    let createdYouthUser = await userDao.create(youthUserData);
    let createdAdultUser = await userDao.create(adultUserData);
    
    // Create youth
    let newYouth = {
        id_user: createdYouthUser._id,
        position: 'Quarterback',
        dob: new Date('2011-03-20'),
        id_adult: createdAdultUser._id
    };
    
    let created = await youthDao.create(newYouth);
    let deleted = await youthDao.del(created._id);
    
    // Try to find deleted youth
    let youths = await youthDao.readAllYouth();
    let found = youths.find(y => y._id.equals(created._id));
    
    expect(found).toBeUndefined();
    expect(deleted._id).toEqual(created._id);
});

test('Read All Youths', async function(){
    // Create adult user
    let adultUserData = {
        name: 'Adult Test',
        email: 'adult@test.com',
        password: '123456',
        permission: 1,
        username: 'adultuser',
        phone: '0987654321'
    };
    let createdAdultUser = await userDao.create(adultUserData);
    
    // Create 3 youth users
    let youth1Data = {
        name: 'Youth 1',
        email: 'youth1@test.com',
        password: '123456',
        permission: 3,
        username: 'youth1',
        phone: '1111111111'
    };
    let youth2Data = {
        name: 'Youth 2',
        email: 'youth2@test.com',
        password: '123456',
        permission: 3,
        username: 'youth2',
        phone: '2222222222'
    };
    let youth3Data = {
        name: 'Youth 3',
        email: 'youth3@test.com',
        password: '123456',
        permission: 3,
        username: 'youth3',
        phone: '3333333333'
    };
    
    let youthUser1 = await userDao.create(youth1Data);
    let youthUser2 = await userDao.create(youth2Data);
    let youthUser3 = await userDao.create(youth3Data);
    
    // Create youth records
    await youthDao.create({
        id_user: youthUser1._id,
        position: 'Wide Receiver',
        dob: new Date('2010-01-10'),
        id_adult: createdAdultUser._id
    });
    await youthDao.create({
        id_user: youthUser2._id,
        position: 'Linebacker',
        dob: new Date('2011-02-15'),
        id_adult: createdAdultUser._id
    });
    await youthDao.create({
        id_user: youthUser3._id,
        position: 'Cornerback',
        dob: new Date('2012-03-20'),
        id_adult: createdAdultUser._id
    });
    
    let allYouths = await youthDao.readAllYouth();
    
    expect(allYouths.length).toBe(3);
});

test('Find Youths by Adult ID', async function(){
    // Create 2 adults
    let adult1Data = {
        name: 'Adult 1',
        email: 'adult1@test.com',
        password: '123456',
        permission: 1,
        username: 'adult1',
        phone: '1111111111'
    };
    let adult2Data = {
        name: 'Adult 2',
        email: 'adult2@test.com',
        password: '123456',
        permission: 1,
        username: 'adult2',
        phone: '2222222222'
    };
    
    let adult1 = await userDao.create(adult1Data);
    let adult2 = await userDao.create(adult2Data);
    
    // Create youth users
    let youth1Data = {
        name: 'Youth 1',
        email: 'youth1@test.com',
        password: '123456',
        permission: 3,
        username: 'youth1',
        phone: '3333333333'
    };
    let youth2Data = {
        name: 'Youth 2',
        email: 'youth2@test.com',
        password: '123456',
        permission: 3,
        username: 'youth2',
        phone: '4444444444'
    };
    let youth3Data = {
        name: 'Youth 3',
        email: 'youth3@test.com',
        password: '123456',
        permission: 3,
        username: 'youth3',
        phone: '5555555555'
    };
    
    let youthUser1 = await userDao.create(youth1Data);
    let youthUser2 = await userDao.create(youth2Data);
    let youthUser3 = await userDao.create(youth3Data);
    
    // Create youths - 2 under adult1, 1 under adult2
    await youthDao.create({
        id_user: youthUser1._id,
        position: 'Safety',
        dob: new Date('2010-05-10'),
        id_adult: adult1._id
    });
    await youthDao.create({
        id_user: youthUser2._id,
        position: 'Defensive End',
        dob: new Date('2011-06-15'),
        id_adult: adult1._id
    });
    await youthDao.create({
        id_user: youthUser3._id,
        position: 'Tight End',
        dob: new Date('2012-07-20'),
        id_adult: adult2._id
    });
    
    let adult1Youths = await youthDao.findByAdultId(adult1._id);
    let adult2Youths = await youthDao.findByAdultId(adult2._id);
    
    expect(adult1Youths.length).toBe(2);
    expect(adult2Youths.length).toBe(1);
    expect(adult2Youths[0].position).toBe('Tight End');
});

test('Update Youth', async function(){
    // Create users
    let youthUserData = {
        name: 'Youth Test',
        email: 'youth@test.com',
        password: '123456',
        permission: 3,
        username: 'youthuser',
        phone: '1234567890'
    };
    let adultUserData = {
        name: 'Adult Test',
        email: 'adult@test.com',
        password: '123456',
        permission: 1,
        username: 'adultuser',
        phone: '0987654321'
    };
    
    let youthUser = await userDao.create(youthUserData);
    let adultUser = await userDao.create(adultUserData);
    
    // Create youth
    let newYouth = {
        id_user: youthUser._id,
        position: 'Running Back',
        dob: new Date('2010-05-15'),
        id_adult: adultUser._id
    };
    
    let created = await youthDao.create(newYouth);
    
    // Update position
    let updates = { position: 'Fullback' };
    let updated = await youthDao.update(created._id, updates);
    
    expect(updated.position).toBe('Fullback');
    expect(updated._id).toEqual(created._id);
});

test('Check if Youth is Under Adult', async function(){
    // Create users
    let youthUserData = {
        name: 'Youth Test',
        email: 'youth@test.com',
        password: '123456',
        permission: 3,
        username: 'youthuser',
        phone: '1234567890'
    };
    let adult1Data = {
        name: 'Adult 1',
        email: 'adult1@test.com',
        password: '123456',
        permission: 1,
        username: 'adult1',
        phone: '1111111111'
    };
    let adult2Data = {
        name: 'Adult 2',
        email: 'adult2@test.com',
        password: '123456',
        permission: 1,
        username: 'adult2',
        phone: '2222222222'
    };
    
    let youthUser = await userDao.create(youthUserData);
    let adult1 = await userDao.create(adult1Data);
    let adult2 = await userDao.create(adult2Data);
    
    // Create youth under adult1
    let newYouth = {
        id_user: youthUser._id,
        position: 'Center',
        dob: new Date('2010-08-25'),
        id_adult: adult1._id
    };
    
    let created = await youthDao.create(newYouth);
    
    // Check relationships
    let isUnderAdult1 = await youthDao.isYouthUnderAdult(created._id, adult1._id);
    let isUnderAdult2 = await youthDao.isYouthUnderAdult(created._id, adult2._id);
    
    expect(isUnderAdult1).toBe(true);
    expect(isUnderAdult2).toBe(false);
});