// We import the entire file, which includes both the class and the exported handlers
const controllerFile = require('./GameController.js');
const { GameController } = controllerFile; // The class
const { create, getAll, update, delete: deleteHandler } = controllerFile; // The handlers

// We import the dao so we can control its mock implementation
const gameDao = require('../model/GameDao.js');

// Tell Jest to use the mock we created in 'model/__mocks__/GameDao.js'
jest.mock('../model/GameDao.js');

// A sample game object to use in tests
const mockGame = {
    _id: '638a5b5b8f8a1b2c3d4e5f67',
    team1: 'Team A',
    team2: 'Team B',
    date: new Date(),
    location: 'Stadium A',
    link: 'http://example.com/game/1'
};


// --- Main Test Suite for GameController.js ---
describe('GameController.js Tests', () => {

    // Reset mocks before each test to ensure test independence
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Unit Tests for the GameController Class ---
    describe('GameController Class (Unit Tests)', () => {
        let gameController;
        let mockRes;

        beforeEach(() => {
            gameController = new GameController();
            // This is a simple mock for the controller's internal logic
            mockRes = {
                status: null,
                send: null,
            };
        });

        // --- createNewGame ---
        describe('createNewGame', () => {
            it('should create a new game with valid data and return a 200 status', async () => {
                const mockReq = { team1: 'Team A', team2: 'Team B' };
                gameDao.create.mockResolvedValue(mockGame);

                await gameController.createNewGame(mockReq, mockRes);

                expect(gameDao.create).toHaveBeenCalledWith(mockReq);
                expect(mockRes.status).toBe(200);
                expect(mockRes.send).toEqual({ success: true, game: mockGame });
            });

            it('should return a 400 error if team1 is missing', async () => {
                const mockReq = { team2: 'Team B' };
                await gameController.createNewGame(mockReq, mockRes);
                expect(gameDao.create).not.toHaveBeenCalled();
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "There must be at least 2 teams in order to create a game" });
            });

            it('should return a 400 error if the request is null', async () => {
                await gameController.createNewGame(null, mockRes);
                expect(gameDao.create).not.toHaveBeenCalled();
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "Request is empty" });
            });
        });

        // --- getAllGames ---
        describe('getAllGames', () => {
            it('should fetch all games and return a 200 status', async () => {
                const gamesArray = [mockGame, { ...mockGame, _id: 'anotherId' }];
                gameDao.readAll.mockResolvedValue(gamesArray);

                await gameController.getAllGames({}, mockRes); // req object can be empty

                expect(gameDao.readAll).toHaveBeenCalledTimes(1);
                expect(mockRes.status).toBe(200);
                expect(mockRes.send).toEqual(gamesArray);
            });
        });

        // --- updateGame ---
        describe('updateGame', () => {
            it('should update a game with valid ID and data, returning 200 status', async () => {
                const updateReq = { id: mockGame._id, team1: 'Updated Team A', team2: 'Updated Team B' };
                const updatedGame = { ...mockGame, team1: 'Updated Team A' };
                
                gameDao.update.mockResolvedValue(updatedGame);

                await gameController.updateGame(updateReq, mockRes);
                
                const expectedUpdateData = {
                    team1: updateReq.team1,
                    team2: updateReq.team2,
                    date: undefined,
                    location: undefined,
                    link: undefined
                };

                expect(gameDao.update).toHaveBeenCalledWith(updateReq.id, expectedUpdateData);
                expect(mockRes.status).toBe(200);
                expect(mockRes.send).toEqual({ success: true, game: updatedGame });
            });

            it('should return a 404 error if the game to update is not found', async () => {
                const updateReq = { id: 'nonexistentId', team1: 'Team A', team2: 'Team B' };
                gameDao.update.mockResolvedValue(null); // Simulate game not found
                await gameController.updateGame(updateReq, mockRes);
                expect(mockRes.status).toBe(404);
                expect(mockRes.send).toEqual({ error: "Game not found" });
            });
            
            it('should return a 400 error if team names are missing in update', async () => {
                const updateReq = { id: mockGame._id, team1: 'Team A' };
                await gameController.updateGame(updateReq, mockRes);
                expect(gameDao.update).not.toHaveBeenCalled();
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "There must be at least 2 teams" });
            });
        });

        // --- deleteGame ---
        describe('deleteGame', () => {
            it('should delete a game with a valid ID and return 200 status', async () => {
                const deleteReq = { id: mockGame._id };
                gameDao.del.mockResolvedValue(true); // Simulate successful deletion
                await gameController.deleteGame(deleteReq, mockRes);
                expect(gameDao.del).toHaveBeenCalledWith(deleteReq.id);
                expect(mockRes.status).toBe(200);
                expect(mockRes.send).toEqual({ success: true, message: "Game deleted successfully" });
            });

            it('should return a 404 error if the game to delete is not found', async () => {
                const deleteReq = { id: 'nonexistentId' };
                gameDao.del.mockResolvedValue(null); // Simulate game not found
                await gameController.deleteGame(deleteReq, mockRes);
                expect(mockRes.status).toBe(404);
                expect(mockRes.send).toEqual({ error: "Game not found" });
            });
        });

        // --- deleteAllGames ---
        describe('deleteAllGames', () => {
            it('should delete all games and return a 200 status', async () => {
                gameDao.deleteAll.mockResolvedValue(true);
                await gameController.deleteAllGames({}, mockRes);
                expect(gameDao.deleteAll).toHaveBeenCalledTimes(1);
                expect(mockRes.status).toBe(200);
                expect(mockRes.send).toEqual({ success: true, message: "All games deleted successfully" });
            });
        });
    });


    // --- Integration Tests for Exported Handlers ---
    describe('Exported Handlers (Integration Tests)', () => {
        let mockRequest;
        let mockResponse;

        beforeEach(() => {
            // This is a full Express-style mock response
            mockResponse = {
                status: jest.fn(() => mockResponse), // Allows chaining
                json: jest.fn(),
                send: jest.fn(),
                redirect: jest.fn(),
            };
        });

        // --- exports.create ---
        describe('exports.create', () => {
            it('should redirect on success for form submission', async () => {
                mockRequest = {
                    body: { team1: 'Team A', team2: 'Team B' },
                    headers: { 'content-type': 'application/x-www-form-urlencoded' }
                };
                gameDao.create.mockResolvedValue(mockGame); // Simulate success

                await create(mockRequest, mockResponse);

                expect(gameDao.create).toHaveBeenCalled();
                expect(mockResponse.redirect).toHaveBeenCalledWith('/calendar.html');
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should return JSON on success for JSON request', async () => {
                mockRequest = {
                    body: { team1: 'Team A', team2: 'Team B' },
                    headers: { 'content-type': 'application/json' }
                };
                gameDao.create.mockResolvedValue(mockGame); // Simulate success

                await create(mockRequest, mockResponse);

                expect(gameDao.create).toHaveBeenCalled();
                expect(mockResponse.redirect).not.toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith({ success: true, game: mockGame });
            });

            it('should return 400 and send error for failed form submission', async () => {
                mockRequest = {
                    body: { team1: 'Team A' }, // Missing team2
                    headers: { 'content-type': 'application/x-www-form-urlencoded' }
                };
                
                await create(mockRequest, mockResponse);

                expect(gameDao.create).not.toHaveBeenCalled();
                expect(mockResponse.redirect).not.toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.send).toHaveBeenCalledWith("There must be at least 2 teams in order to create a game");
            });
        });

        // --- exports.getAll ---
        describe('exports.getAll', () => {
            it('should return all games as JSON with 200 status', async () => {
                mockRequest = {};
                const gamesArray = [mockGame];
                gameDao.readAll.mockResolvedValue(gamesArray);

                await getAll(mockRequest, mockResponse);

                expect(gameDao.readAll).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith(gamesArray);
            });
        });

        // --- exports.update ---
        describe('exports.update', () => {
            it('should update a game and return JSON with 200 status', async () => {
                mockRequest = {
                    params: { id: 'game123' },
                    body: { team1: 'New Team A', team2: 'New Team B' }
                };
                const updatedGame = { ...mockGame, team1: 'New Team A' };
                gameDao.update.mockResolvedValue(updatedGame);

                await update(mockRequest, mockResponse);

                expect(gameDao.update).toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith({ success: true, game: updatedGame });
            });

            it('should return 404 JSON if game to update is not found', async () => {
                mockRequest = {
                    params: { id: 'badId' },
                    body: { team1: 'New Team A', team2: 'New Team B' }
                };
                gameDao.update.mockResolvedValue(null); // Simulate not found

                await update(mockRequest, mockResponse);

                expect(gameDao.update).toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(404);
                expect(mockResponse.json).toHaveBeenCalledWith({ error: "Game not found" });
            });
        });

        // --- exports.delete ---
        describe('exports.delete', () => {
            it('should delete a game and return JSON with 200 status', async () => {
                mockRequest = {
                    params: { id: 'game123' },
                    body: {}
                };
                gameDao.del.mockResolvedValue(true); // Simulate success

                await deleteHandler(mockRequest, mockResponse);

                expect(gameDao.del).toHaveBeenCalledWith('game123');
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: "Game deleted successfully" });
            });

            it('should correctly get id from body if not in params', async () => {
                mockRequest = {
                    params: {},
                    body: { id: 'bodyId123' } // ID is in the body
                };
                gameDao.del.mockResolvedValue(true); // Simulate success

                await deleteHandler(mockRequest, mockResponse);

                expect(gameDao.del).toHaveBeenCalledWith('bodyId123'); // Correctly called with body ID
                expect(mockResponse.status).toHaveBeenCalledWith(200);
            });
        });
    });
});
// link for testing 
// https://player.vimeo.com/video/890704111