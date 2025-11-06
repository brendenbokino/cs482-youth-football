const dbcon = require('./DbConnect');
const dao = require('./UserDao');

beforeAll(async function(){ 
    await dbcon.connect('test');
});
afterAll(async function(){ 
    await dao.deleteAll();
    dbcon.disconnect();
});
beforeEach(async function(){ 
    await dao.deleteAll();
});
afterEach(function(){
    //No need
 
});

test('Create new message', async () => {
  const newMessage = {
    message: 'Hi there',
    author: 'Loren',
    authorType: 1
  };

  const created = await MessageDao.create(newMessage);
  const found = await MessageDao.findById(created._id);

  expect(created._id).not.toBeNull();
  expect(found.message).toBe('Hi there');
  expect(found.author).toBe('Loren');
});

test('Read all messages', async () => {
  const msg1 = { message: 'Test 1', author: 'Alice', authorType: 1 };
  const msg2 = { message: 'Test 2', author: 'Bob', authorType: 2 };
  const msg3 = { message: 'Test 3', author: 'Carol', authorType: 3 };

  await MessageDao.create(msg1);
  await MessageDao.create(msg2);
  await MessageDao.create(msg3);

  const messages = await MessageDao.readAll();

  expect(messages.length).toBe(3);
  expect(messages[0]).toHaveProperty('message');
});

