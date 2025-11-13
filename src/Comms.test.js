const MessageDao = require('../model/MessageDao');
const Comms = require('../src/Comms');

jest.mock('../model/MessageDao', () => ({
    readAll: jest.fn(),
}));

describe('Comms Class', () => {
    let comms;

    beforeEach(() => {
        comms = new Comms();
        comms.currentUser = { name: 'Test User' }; // Mock a logged-in user
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('viewMessages should log messages when messages exist', async () => {
        const mockMessages = [
            { dateCreated: new Date(), author: 'User1', message: 'Hello World', replies: [] },
            { dateCreated: new Date(), author: 'User2', message: 'Hi there', replies: [] },
        ];
        MessageDao.readAll.mockResolvedValue(mockMessages);

        console.log = jest.fn(); // Mock console.log

        await comms.viewMessages();

        expect(MessageDao.readAll).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Message Board:'));
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('1. ['));
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Hello World'));
    });

    test('viewMessages should log "No messages." when no messages exist', async () => {
        MessageDao.readAll.mockResolvedValue([]);

        console.log = jest.fn(); // Mock console.log

        await comms.viewMessages();

        expect(MessageDao.readAll).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('No messages.');
    });

    test('viewMessages should prompt login if currentUser is null', async () => {
        comms.currentUser = null;
        console.log = jest.fn();

        await comms.viewMessages();

        expect(console.log).toHaveBeenCalledWith('Please log in to view messages.');
    });
});
