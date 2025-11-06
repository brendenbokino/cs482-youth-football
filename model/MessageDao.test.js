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

test('Find message by ID', async () => {
  const msg = { message: 'Find me', author: 'Finder', authorType: 1 };
  const created = await MessageDao.create(msg);

  const found = await MessageDao.findById(created._id);

  expect(found).not.toBeNull();
  expect(found._id.toString()).toEqual(created._id.toString());
  expect(found.message).toBe('Find me');
});

test('Update message', async () => {
  const msg = { message: 'Old text', author: 'Loren', authorType: 1 };
  const created = await MessageDao.create(msg);

  const updated = await MessageDao.update(created._id, { message: 'Updated text' });

  expect(updated.message).toBe('Updated text');
  expect(updated.edited).toBe(true);
  expect(updated.dateEdited).not.toBeNull();
});

test('Add reply to message', async () => {
  // add next iteration
});

test('Delete message', async () => {
  const msg = { message: 'Delete me', author: 'Temp', authorType: 1 };
  const created = await MessageDao.create(msg);

  await MessageDao.delete(created._id);
  const found = await MessageDao.findById(created._id);

  expect(found).toBeNull();
});

test('Check author', async () => {
  const msg = { message: 'My post', author: 'Loren', authorType: 1 };
  const created = await MessageDao.create(msg);

  const valid = await MessageDao.isAuthor(created._id, 'Loren');
  const invalid = await MessageDao.isAuthor(created._id, 'NotLoren');

  expect(valid).toBe(true);
  expect(invalid).toBe(false);
});

