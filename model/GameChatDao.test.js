const dbcon = require('./DbConnect');
const dao = require('./GameChatDao');

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

test('Delete message', async () => {
  const msg = { message: 'Delete me', author: 'Temp', authorType: 1 };
  const created = await dao.create(msg);

  await dao.delete(created._id);
  const found = await dao.findById(created._id);

  expect(found).toBeNull();
});

test('Check author', async () => {
  const msg = { message: 'My post', author: 'Loren', authorType: 1 };
  const created = await dao.create(msg);

  const valid = await dao.isAuthor(created._id, 'Loren');
  const invalid = await dao.isAuthor(created._id, 'NotLoren');

  expect(valid).toBe(true);
  expect(invalid).toBe(false);
});

test('Read messages by gameId', async () => {
  const gameId = 'game123';
  const msg1 = { gameId, message: 'Game message 1', author: 'Alice', authorType: 1 };
  const msg2 = { gameId, message: 'Game message 2', author: 'Bob', authorType: 2 };

  await dao.create(msg1);
  await dao.create(msg2);

  const messages = await dao.readByGameId(gameId);

  expect(messages.length).toBe(2);
  expect(messages[0].gameId).toBe(gameId);
  expect(messages[1].gameId).toBe(gameId);
});

test('Create message for a game within valid time', async () => {
  const gameId = 'game123';
  const gameDao = {
    read: jest.fn().mockResolvedValue({
      startTime: new Date(Date.now() - 1000),
      endTime: new Date(Date.now() + 1000),
    }),
  };
  dao.__set__('gameDao', gameDao);

  const newMessage = { message: 'Game chat', author: 'Loren', authorType: 1 };
  const created = await dao.createForGame(gameId, newMessage);

  expect(created).not.toBeNull();
  expect(created.gameId).toBe(gameId);
});

test('Fail to create message for a game outside valid time', async () => {
  const gameId = 'game123';
  const gameDao = {
    read: jest.fn().mockResolvedValue({
      startTime: new Date(Date.now() + 1000),
      endTime: new Date(Date.now() + 2000),
    }),
  };
  dao.__set__('gameDao', gameDao);

  const newMessage = { message: 'Game chat', author: 'Loren', authorType: 1 };

  await expect(dao.createForGame(gameId, newMessage)).rejects.toThrow('Chats can only be added during the game time');
});

test('Add reply to non-existent message', async () => {
  const reply = { email: 'responder@test.com', message: 'Reply here' };
  const updated = await dao.addReply('nonexistentId', reply);

  expect(updated).toBeNull();
});

test('Update non-existent message', async () => {
  const updates = { message: 'Updated text' };
  const updated = await dao.update('nonexistentId', updates);

  expect(updated).toBeNull();
});

test('Read all messages by author', async () => {
  const author = 'Author1';
  const msg1 = { message: 'Message 1', author, authorType: 1 };
  const msg2 = { message: 'Message 2', author, authorType: 1 };
  const msg3 = { message: 'Message 3', author: 'Author2', authorType: 2 };
  
  await dao.create(msg1);
  await dao.create(msg2);
  await dao.create(msg3);
  const messages = await dao.readByAuthor(author);
  
  expect(messages.length).toBe(2);
  expect(messages[0].author).toBe(author);
  expect(messages[1].author).toBe(author);
});

test('Read all messages by authorType', async () => {
  const authorType = 1;
  const msg1 = { message: 'Message 1', author: 'Author1', authorType };
  const msg2 = { message: 'Message 2', author: 'Author2', authorType };
  const msg3 = { message: 'Message 3', author: 'Author3', authorType: 2 };
  
  await dao.create(msg1);
  await dao.create(msg2);
  await dao.create(msg3);
  const messages = await dao.readByAuthorType(authorType);
  
  expect(messages.length).toBe(2);
  expect(messages[0].authorType).toBe(authorType);
  expect(messages[1].authorType).toBe(authorType);
});

test('Find by id', async () => {
  const msg = { message: 'Find me', author: 'Finder', authorType: 1 };
  const created = await dao.create(msg);

  const found = await dao.findById(created._id);

  expect(found).not.toBeNull();
  expect(found._id.toString()).toEqual(created._id.toString());
  expect(found.message).toBe('Find me');
});

test('Add reply', async () => {
  const msg = { message: 'Original', author: 'Poster', authorType: 1 };
  const created = await dao.create(msg);

  const reply = { email: 'test@gmail.com', message: 'This is a reply' };
  const updated = await dao.addReply(created._id, reply);
  
  expect(updated.replies.length).toBe(1);
  expect(updated.replies[0].email).toBe('test@gmail.com');
  expect(updated.replies[0].message).toBe('This is a reply');
});
/*
test('Add reply to a message', async () => {
  const msg = { message: 'og message', author: 'Me', authorType: 1 };
  const created = await dao.create(msg);

  const reply = { email: 'reply@test.com', message: 'reply msg' };
  const updated = await dao.addReply(created._id, reply);

  expect(updated.replies.length).toBe(1);
  expect(updated.replies[0].email).toBe('reply@test.com');
  expect(updated.replies[0].message).toBe('reply msg');
});

test('Fail to add reply to non-existent message', async () => {
  const reply = { email: 'reply@test.com', message: 'reply msg' };
  const updated = await dao.addReply('nonexistentId', reply);

  expect(updated).toBeNull();
});

test('Update a message', async () => {
  const msg = { message: 'Initial message', author: 'Author', authorType: 1 };
  const created = await dao.create(msg);

  const updates = { message: 'Updated message' };
  const updated = await dao.update(created._id, updates);

  expect(updated.message).toBe('Updated message');
  expect(updated.edited).toBe(true);
  expect(updated.dateEdited).not.toBeNull();
});

test('Fail to update non-existent message', async () => {
  const updates = { message: 'Updated message' };
  const updated = await dao.update('nonexistentId', updates);

  expect(updated).toBeNull();
});

test('Read messages by author', async () => {
  const author = 'Author1';
  const msg1 = { message: 'Message 1', author, authorType: 1 };
  const msg2 = { message: 'Message 2', author, authorType: 1 };
  const msg3 = { message: 'Message 3', author: 'Author2', authorType: 2 };

  await dao.create(msg1);
  await dao.create(msg2);
  await dao.create(msg3);

  const messages = await dao.readByAuthor(author);

  expect(messages.length).toBe(2);
  expect(messages[0].author).toBe(author);
  expect(messages[1].author).toBe(author);
});

test('Read messages by authorType', async () => {
  const authorType = 1;
  const msg1 = { message: 'Message 1', author: 'Author1', authorType };
  const msg2 = { message: 'Message 2', author: 'Author2', authorType };
  const msg3 = { message: 'Message 3', author: 'Author3', authorType: 2 };

  await dao.create(msg1);
  await dao.create(msg2);
  await dao.create(msg3);

  const messages = await dao.readByAuthorType(authorType);

  expect(messages.length).toBe(2);
  expect(messages[0].authorType).toBe(authorType);
  expect(messages[1].authorType).toBe(authorType);
});

test('Fail to delete non-existent message', async () => {
  const deleted = await dao.delete('nonexistentId');

  expect(deleted).toBeNull();
});*/

