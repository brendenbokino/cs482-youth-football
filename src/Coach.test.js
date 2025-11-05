// src/Coach.test.js
// Loren Kim - 1/2 Coach account tests


// Iteration #1
// Loren Kim - Coach account tests

const dbcon = require('./DbConnection');
const dao = require('../model/UserDao');
const Coach = require('../controller/Coach');

beforeAll(function() {
    dbcon.connect("test");
});

afterAll(async function() {
    await dao.deleteAll();
    dbcon.disconnect();
});

beforeEach(async function() {
    await dao.deleteAll();
});

test('Read All w/ Empty DB', async function() {
    let lstUsers = await dao.readAll();
    expect(lstUsers.length).toBe(0);
});

test('Create new Coach Account Simple', async function() {
    let data = {
        name: 'Loren Test',
        email: 'lt@coach.com',
        phone: '1234567890',
        password: 'abcd1234',
        username: 'lorentest',
        permission: 1
    };

    let coach = await dao.create(data);

    expect(coach._id).toBeDefined();
    expect(coach.permission).toBe(1);
    expect(coach.email).toBe('lt@coach.com');
});

test('Create new Coach Account Better', async function() {
    let data = {
        name: 'Loren Test',
        email: 'lt@coach.com',
        phone: '1234567890',
        password: 'abcd1234',
        username: 'lorentest',
        permission: 1
    };

    let created = await dao.create(data);
    let found = await dao.readOne(created._id);

    expect(created._id).toBeDefined();
    expect(created.email).toBe(found.email);
    expect(created.username).toBe(found.username);
    expect(found.phone).toBe('1234567890');
});

test('ReadAll with Multiple Coaches', async function() {
    let data1 = { name: 'Coach 1', email: 'c1@coach.com', phone: '1234567890', password: 'pass1', username: 'coach1', permission: 1 };
    let data2 = { name: 'Coach 2', email: 'c2@coach.com', phone: '2345678901', password: 'pass2', username: 'coach2', permission: 2 };
    let data3 = { name: 'Coach 3', email: 'c3@coach.com', phone: '3456789012', password: 'pass3', username: 'coach3', permission: 1 };

    await dao.create(data1);
    await dao.create(data2);
    await dao.create(data3);

    let lstUsers = await dao.readAll();
    expect(lstUsers.length).toBe(3);
});

test('Update Coach Account', async function() {
    let data = {
        name: 'Coach Update',
        email: 'update@coach.com',
        phone: '9876543210',
        password: 'abcd',
        username: 'updateme',
        permission: 1
    };

    let created = await dao.create(data);

    let updates = { phone: '1112223333', password: 'newpass' };
    let updatedUser = await dao.update(created._id, updates);

    expect(updatedUser.phone).toBe('1112223333');
    expect(updatedUser.password).toBe('newpass');
});

test('Delete Coach Account', async function() {
    let data = {
        name: 'Coach Delete',
        email: 'delete@coach.com',
        phone: '5555555555',
        password: 'toDelete',
        username: 'delcoach',
        permission: 1
    };

    let created = await dao.create(data);
    let before = await dao.readAll();
    expect(before.length).toBe(1);

    await dao.del(created._id);
    let after = await dao.readAll();
    expect(after.length).toBe(0);
});

test('Check for Existing Account', async function() {
    let data = {
        name: 'Coach Exists',
        email: 'exists@coach.com',
        phone: '4444444444',
        password: 'exist123',
        username: 'exists',
        permission: 1
    };

    await dao.create(data);
    const coach = new Coach();
    const users = await dao.readAll();
    expect(users.find(u => u.email === 'exists@coach.com')).toBeDefined();
});
