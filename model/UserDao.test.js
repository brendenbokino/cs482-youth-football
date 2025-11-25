// Code from Rosha Parking

/*jest.mock('./DbConnect', () => ({
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
}));*/

const dbcon = require('./DbConnect');
const dao = require('./UserDao');

beforeAll(async function(){ //Executed once before all tests
    //jest.setTimeout(20000);
    await dbcon.connect('test');
});
afterAll(async function(){ // Executed once after all tests have ran
    await dao.deleteAll();
    dbcon.disconnect();
});
beforeEach(async function(){ // Executed before each test
    await dao.deleteAll();
});
afterEach(async function(){
    await dao.deleteAll();
});

test('Create new user test',async function(){
    let newdata = {name:'Test',email:'test@test.com',
                  password:'123456',permission:1,username: 'tester',
                  phone: '1234567890'};
    let created = await dao.create(newdata);
    let found = await dao.read(created._id);
    
    //assertions
    expect(created._id).not.toBeNull(); // id cannot be null after creation
    expect(created.email).toBe(found.email); //login should match with found
});

test('Delete User', async function(){
    let newdata = {name:'Test',email:'test@test.com',
        password:'123456',permission:1,username: 'tester',
        phone: '1234567890'};
    let created = await dao.create(newdata); // create a new user
    let deleted = await dao.del(created._id); // then we delete the user
    let found = await dao.read(created._id); // we search for the deleted user

    expect(found).toBeNull(); // should be null since we deleted it
    expect(deleted._id).toEqual(created._id); //the one we created should ne the same deleted
    // Use "toEqual" for _id
});

test('Read All', async function(){
    let newdata1 = {name:'Test',email:'test1@test.com',
                    password:'123456',permission:1,username: 'tester',
                    phone: '1234567890'};
    let newdata2 = {name:'Test 2',email:'test2@test.com',
                  password:'123456',permission:1,username:'tester2',
                  phone: '0987654321'};
    let newdata3 = {name:'Test 3',email:'test3@test.com',
                  password:'123456',permission:1,username:'tester3',
                  phone: '5555555555'};

    await dao.create(newdata1);
    await dao.create(newdata2);
    await dao.create(newdata3); //create 3 users

    let lstUsers = await dao.readAll(); // read all users

    expect(lstUsers.length).toBe(3); //should be a list of 3
    expect(lstUsers[0].email).toBe("test1@test.com"); // 1st user login is test1 
});

test('Find Login username', async function(){
    let newdata = {name:'Test',email:'test@test.com',
                password:'123456',permission:1,username: 'tester',
                phone: '1234567890'};
    let created = await dao.create(newdata); // create a new user

    let logged = await dao.findLogin(newdata.username);

    expect(logged).not.toBeNull();
    expect(logged._id).toEqual(created._id);
    expect(logged.email).toEqual(created.email);
});

test('Find Login email', async function(){
    let newdata = {name:'Test',email:'test@test.com',
                password:'123456',permission:1,username: 'tester',
                phone: '1234567890'};
    let created = await dao.create(newdata); // create a new user

    let logged = await dao.findLogin(newdata.email);

    expect(logged).not.toBeNull();
    expect(logged._id).toEqual(created._id);
    expect(logged.email).toEqual(created.email);
});

test('Login not found', async function(){
    let newdata = {name:'Test',email:'test@test.com',
                password:'123456',permission:1,username: 'tester',
                phone: '1234567890'};
    let created = await dao.create(newdata); // create a new user

    let badlogged = await dao.findLogin("not the login","654321"); //should not find
    expect(badlogged).toBeNull();
});

test('Update user', async function() {
    let newdata = {
        name: 'Test',
        email: 'test@test.com',
        username: 'tester',
        phone: '1234567890',
        password: '123456',
        permission: 1
    };
  
    let created = await dao.create(newdata);
    let updates = { name: 'Updated Test' };
    let updated = await dao.update(created._id, updates);
  
    expect(updated.name).toBe('Updated Test');
});

test('Find user by permission level', async function() {
    let newdata = {
        name: 'Test',
        email: 'test@test.com',
        username: 'tester',
        phone: '1234567890',
        password: '123456',
        permission: 1
    };

    let created = await dao.create(newdata);
    let foundUsers = await dao.findByPermission(1); 
    expect(foundUsers.length).toBe(1);
});
  