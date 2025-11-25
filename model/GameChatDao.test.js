const { describe } = require('yargs');
const dbcon = require('./DbConnect');
const dao = require('./GameChatDao');
const mongoose = require('mongoose');

beforeAll(async function(){ 
    await dbcon.connect('test');
});
afterAll(async function(){ 
    await dao.deleteAll();
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
    gameId: '0',
    message: 'Hi there',
    author: 'Loren',
    authorType: 1,
  };

  const created = await dao.create(newMessage);
  const found = await dao.findById(created._id);

  expect(created._id).not.toBeNull();
  expect(found.message).toBe('Hi there');
  expect(found.author).toBe('Loren');
});

test('Error when creating message without author', async () => {
  const newMessage = {
    gameId: '0',
    message: 'No author here',
    authorType: 1,
  };

  await expect(dao.create(newMessage)).rejects.toThrow();
});

test('Read all messages', async () => {
  const msg1 = { gameId: '0', message: 'Test 1', author: 'Alice', authorType: 1 };
  const msg2 = { gameId: '0', message: 'Test 2', author: 'Bob', authorType: 2 };
  const msg3 = { gameId: '0', message: 'Test 3', author: 'Carol', authorType: 3 };

  await dao.create(msg1);
  await dao.create(msg2);
  await dao.create(msg3);

  const messages = await dao.readAll();

  expect(messages.length).toBe(4);
  expect(messages[0]).toHaveProperty('message');
});

test('Read by gameId', async () => {
  const msg1 = { gameId: 'game1', message: 'Game 1 Msg', author: 'Loren', authorType: 1 };
  const msg2 = { gameId: 'game2', message: 'Game 2 Msg', author: 'Brenden', authorType: 2 };
  const msg3 = { gameId: 'game1', message: 'Another Game 1 Msg', author: 'Oscar', authorType: 3 };

  await dao.create(msg1);
  await dao.create(msg2);
  await dao.create(msg3);

  const game1Messages = await dao.readByGameId('game1');

  expect(game1Messages.length).toBe(2);
  expect(game1Messages[0].gameId).toBe('game1');
  expect(game1Messages[1].gameId).toBe('game1');
});

test('Create for gameId', async () => {
  const msg = { gameId: 'gameX', message: 'Hello', author: 'Reece', authorType: 1 };
  const created = await dao.create(msg);

  expect(created.gameId).toBe('gameX');
  expect(created.message).toBe('Hello');
  expect(created.author).toBe('Reece');
});

test('Error read by non-existent gameId', async () => {
  const messages = await dao.readByGameId('nonexistentGameId');

  expect(messages.length).toBe(0);
});

test('Find message by ID', async () => {
  const msg = { gameId: '0', message: 'Find me', author: 'Finder', authorType: 1 };
  const created = await dao.create(msg);

  const found = await dao.findById(created._id);

  expect(found).not.toBeNull();
  expect(found._id.toString()).toEqual(created._id.toString());
  expect(found.message).toBe('Find me');
});

test('Update message', async () => {
  const msg = { gameId: '0', message: 'Old text', author: 'Loren', authorType: 1 };
  const created = await dao.create(msg);

  const updated = await dao.update(created._id, { message: 'Updated text' });

  expect(updated.message).toBe('Updated text');
  expect(updated.edited).toBe(true);
  expect(updated.dateEdited).not.toBeNull();
});

test('Add reply to message', async () => {
  const msg = { gameId: '0', message: 'Original', author: 'Poster', authorType: 1 };
  const created = await dao.create(msg);

  const reply = { email: 'responder@test.com', message: 'Reply here' };
  const updated = await dao.addReply(created._id, reply);

  expect(updated.replies.length).toBe(1);
  expect(updated.replies[0].email).toBe('responder@test.com');
});

test('Add reply to non-existent message', async () => {
  const reply = { gameId: '0', email: 'responder@test.com', message: 'Reply here' };
  const updated = await dao.addReply(new mongoose.Types.ObjectId(), reply);

  expect(updated).toBeNull();
});

test('Delete message', async () => {
  const msg = { gameId: '0', message: 'Delete me', author: 'Temp', authorType: 1 };
  const created = await dao.create(msg);

  await dao.delete(created._id);
  const found = await dao.findById(created._id);

  expect(found).toBeNull();
});

test('Update non-existent message', async () => {
  const updates = { message: 'Updated text' };
  const updated = await dao.update(new mongoose.Types.ObjectId(), updates);

  expect(updated).toBeNull();
});



test('Check author', async () => {
  const msg = { gameId: '0', message: 'My post', author: 'Loren', authorType: 1 };
  const created = await dao.create(msg);

  const valid = await dao.isAuthor(created._id, 'Loren');
  const invalid = await dao.isAuthor(created._id, 'NotLoren');

  expect(valid).toBe(true);
  expect(invalid).toBe(false);
});

test('createForGame throws when outside game time', async () => {
  const msgData = { message: 'Test', author: 'Loren', authorType: 1 };

  await expect(dao.createForGame('game1', msgData))
    .rejects
    .toThrow('gameDao is not defined');
});


