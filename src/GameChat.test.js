jest.mock("../model/GameChatDao", () => ({
  readByGameId: jest.fn(),
}));

const GameChatDao = require("../model/GameChatDao");
const GameChat = require("../src/GameChat");

describe("viewMessagesByGameId()", () => {
  let chat;

  beforeEach(() => {
      jest.clearAllMocks();
      chat = new GameChat();
  });

  test("returns messages when DAO succeeds", async () => {
      const fakeMessages = [{ message: "Hello world" }];
      GameChatDao.readByGameId.mockResolvedValue(fakeMessages);

      const result = await chat.viewMessagesByGameId("123");

      expect(result).toEqual({ messages: fakeMessages });
      expect(GameChatDao.readByGameId).toHaveBeenCalledWith("123");
  });

  test("returns error when DAO throws", async () => {
      GameChatDao.readByGameId.mockRejectedValue(new Error("DB failed"));

      const result = await chat.viewMessagesByGameId("123");

      expect(result).toMatchObject({
          error: "Failed to fetch messages",
          details: "DB failed"
      });
  });
});

describe("viewMessages() method", () => {
    let chat;

    beforeEach(() => {
        chat = new GameChat();
        jest.clearAllMocks();
    });

    test("logs messages when messages exist", async () => {
        const mockMessages = [
            { dateCreated: new Date(), author: 'User1', message: 'Hello World', replies: [] },
            { dateCreated: new Date(), author: 'User2', message: 'Hi there', replies: [] },
        ];
        GameChatDao.readAll = jest.fn().mockResolvedValue(mockMessages);

        console.log = jest.fn(); 

        chat.currentUser = { name: 'Test User' }; 
        await chat.viewMessages();

        expect(GameChatDao.readAll).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Message Board:'));
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('1. ['));
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Hello World'));
    });

    test("logs 'No messages.' when no messages exist", async () => {
        GameChatDao.readAll = jest.fn().mockResolvedValue([]);

        console.log = jest.fn(); 

        chat.currentUser = { name: 'Test User' }; 
        await chat.viewMessages();

        expect(GameChatDao.readAll).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('No messages.');
    });

    test("prompts login if currentUser is null", async () => {
        chat.currentUser = null;
        console.log = jest.fn();

        await chat.viewMessages();

        expect(console.log).toHaveBeenCalledWith('Please log in to view messages.');
    });
});
