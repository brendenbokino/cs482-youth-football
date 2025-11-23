const dbcon = require('./DbConnect');
const dao = require('./MessageDao');

beforeAll(async function(){ 
    await dbcon.connect('test');
});
afterAll(async function(){ 
    await dao.delete();
    dbcon.disconnect();
});
beforeEach(async function(){ 
    await dao.delete();
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

  const created = await dao.create(newMessage);
  const found = await dao.findById(created._id);

  expect(created._id).not.toBeNull();
  expect(found.message).toBe('Hi there');
  expect(found.author).toBe('Loren');
});

test('Read all messages', async () => {
  const msg1 = { message: 'Test 1', author: 'Alice', authorType: 1 };
  const msg2 = { message: 'Test 2', author: 'Bob', authorType: 2 };
  const msg3 = { message: 'Test 3', author: 'Carol', authorType: 3 };

  await dao.create(msg1);
  await dao.create(msg2);
  await dao.create(msg3);

  const messages = await dao.readAll();

  expect(messages.length).toBe(4);
  expect(messages[0]).toHaveProperty('message');
});

test('Find message by ID', async () => {
  const msg = { message: 'Find me', author: 'Finder', authorType: 1 };
  const created = await dao.create(msg);

  const found = await dao.findById(created._id);

  expect(found).not.toBeNull();
  expect(found._id.toString()).toEqual(created._id.toString());
  expect(found.message).toBe('Find me');
});

test('Update message', async () => {
  const msg = { message: 'Old text', author: 'Loren', authorType: 1 };
  const created = await dao.create(msg);

  const updated = await dao.update(created._id, { message: 'Updated text' });

  expect(updated.message).toBe('Updated text');
  expect(updated.edited).toBe(true);
  expect(updated.dateEdited).not.toBeNull();
});

test('Add reply to message', async () => {
  const msg = { message: 'Original', author: 'Poster', authorType: 1 };
  const created = await dao.create(msg);

  const reply = { email: 'responder@test.com', message: 'Reply here' };
  const updated = await dao.addReply(created._id, reply);

  expect(updated.replies.length).toBe(1);
  expect(updated.replies[0].email).toBe('responder@test.com');
});

test('Add reply to non-existent message', async () => {
  const reply = { email: 'responder@test.com', message: 'Reply here' };
  const updated = await dao.addReply('nonexistentId', reply);

  expect(updated).toBeNull();
});

test('Delete message', async () => {
  const msg = { message: 'Delete me', author: 'Temp', authorType: 1 };
  const created = await dao.create(msg);

  await dao.delete(created._id);
  const found = await dao.findById(created._id);

  expect(found).toBeNull();
});

test('Update non-existent message', async () => {
  const updates = { message: 'Updated text' };
  const updated = await dao.update('nonexistentId', updates);

  expect(updated).toBeNull();
});

test('Add photo to message', async () => {
  const msg = { message: 'Photo message', author: 'Loren', authorType: 1 };
  const created = await dao.create(msg);

  const updated = await dao.addPhoto(created._id, 'http://photo.url');

  expect(updated.photo).toBe('http://photo.url');
});

test('Add photo to non-existent message', async () => {
  const updated = await dao.addPhoto('nonexistentId', 'http://photo.url');

  expect(updated).toBeNull();
});

test('Check author', async () => {
  const msg = { message: 'My post', author: 'Loren', authorType: 1 };
  const created = await dao.create(msg);

  const valid = await dao.isAuthor(created._id, 'Loren');
  const invalid = await dao.isAuthor(created._id, 'NotLoren');

  expect(valid).toBe(true);
  expect(invalid).toBe(false);
});

