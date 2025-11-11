// We import the entire file, which includes both the class and the exported handlers
const controllerFile = require('./TeamController.js');
const { TeamController } = controllerFile; // The class
// Import all the exported handlers
const { register, addPlayer, update, getAll, getById } = controllerFile;

// We import the dao so we can control its mock implementation
const TeamDao = require('../model/TeamDao.js');

// Tell Jest to use the mock we created in 'model/__mocks__/TeamDao.js'
jest.mock('../model/TeamDao.js');

// A sample team object to use in tests
const mockTeam = {
  _id: 'team123',
  coach: 'Coach K',
  players: ['Player 1', 'Player 2'],
  games: [],
  teamName: 'Blue Devils'
};


// --- Main Test Suite for TeamController.js ---
describe('TeamController.js Tests', () => {

    // Reset mocks before each test to ensure test independence
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Unit Tests for the TeamController Class ---
    describe('TeamController Class (Unit Tests)', () => {
        let controller;
        let mockRes;

        beforeEach(() => {
            controller = new TeamController();
            // This is a simple mock for the controller's internal logic
            mockRes = {
                status: null,
                send: null,
            };
        });

        // --- createNewTeam ---
        describe('createNewTeam', () => {
            it('should create a team with valid data', async () => {
                const req = { coach: 'Coach K', players: ['Player 1'] };
                TeamDao.create.mockResolvedValue({ ...mockTeam, ...req });
                
                await controller.createNewTeam(req, mockRes);
                
                expect(TeamDao.create).toHaveBeenCalledWith({
                    players: ['Player 1'],
                    coach: 'Coach K',
                    games: []
                });
                expect(mockRes.status).toBe(200);
                expect(mockRes.send.success).toBe(true);
            });

            it('should return 400 if req is null', async () => {
                await controller.createNewTeam(null, mockRes);
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "Request is empty" });
                expect(TeamDao.create).not.toHaveBeenCalled();
            });

            it('should return 400 if players array is empty', async () => {
                const req = { coach: 'Coach K', players: [] };
                await controller.createNewTeam(req, mockRes);
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "Team must have at least one player" });
            });

            it('should return 400 if coach name is empty string', async () => {
                const req = { coach: '   ', players: ['Player 1'] };
                await controller.createNewTeam(req, mockRes);
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "Coach name cannot be empty" });
            });

            it('should return 500 if DAO create fails', async () => {
                const req = { coach: 'Coach K', players: ['Player 1'] };
                TeamDao.create.mockRejectedValue(new Error('DB Error'));
                await controller.createNewTeam(req, mockRes);
                expect(mockRes.status).toBe(500);
                expect(mockRes.send).toEqual({ error: "Failed to create team" });
            });
        });

        // --- getAllTeams ---
        describe('getAllTeams', () => {
            it('should return all teams and status 200', async () => {
                const teamsArray = [mockTeam];
                TeamDao.readAll.mockResolvedValue(teamsArray);

                await controller.getAllTeams({}, mockRes);

                expect(TeamDao.readAll).toHaveBeenCalledTimes(1);
                expect(mockRes.status).toBe(200);
                expect(mockRes.send).toEqual({ success: true, teams: teamsArray });
            });

            it('should return 500 if DAO readAll fails', async () => {
                TeamDao.readAll.mockRejectedValue(new Error('DB Error'));
                await controller.getAllTeams({}, mockRes);
                expect(mockRes.status).toBe(500);
                expect(mockRes.send).toEqual({ error: "Failed to fetch teams" });
            });
        });

        // --- getTeamById ---
        describe('getTeamById', () => {
            it('should return a single team by ID', async () => {
                const req = { params: { id: 'team123' } };
                TeamDao.read.mockResolvedValue(mockTeam);

                await controller.getTeamById(req, mockRes);

                expect(TeamDao.read).toHaveBeenCalledWith('team123');
                expect(mockRes.status).toBe(200);
                expect(mockRes.send).toEqual({ success: true, team: mockTeam });
            });

            it('should return 404 if team not found', async () => {
                const req = { params: { id: 'badId' } };
                TeamDao.read.mockResolvedValue(null);
                await controller.getTeamById(req, mockRes);
                expect(mockRes.status).toBe(404);
                expect(mockRes.send).toEqual({ error: "Team not found" });
            });

            // ADDED: Test for missing ID
            it('should return 400 if ID is not provided', async () => {
                const req = { params: {} }; // Missing id
                await controller.getTeamById(req, mockRes);
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "Team ID is required" });
                expect(TeamDao.read).not.toHaveBeenCalled();
            });

            // ADDED: Test for DAO failure
            it('should return 500 if DAO read fails', async () => {
                const req = { params: { id: 'team123' } };
                TeamDao.read.mockRejectedValue(new Error('DB Error'));
                await controller.getTeamById(req, mockRes);
                expect(mockRes.status).toBe(500);
                expect(mockRes.send).toEqual({ error: "Failed to fetch team" });
            });
        });

        // --- updateTeam ---
        describe('updateTeam', () => {
            it('should update a team with valid data', async () => {
                const req = { params: { id: 'team123' }, body: { coach: 'New Coach' } };
                const updatedTeam = { ...mockTeam, coach: 'New Coach' };
                TeamDao.update.mockResolvedValue(updatedTeam);

                await controller.updateTeam(req, mockRes);

                expect(TeamDao.update).toHaveBeenCalledWith('team123', { coach: 'New Coach' });
                expect(mockRes.status).toBe(200);
                expect(mockRes.send).toEqual({ success: true, message: "Team updated successfully", team: updatedTeam });
            });

            it('should return 400 if update data is invalid', async () => {
                const req = { params: { id: 'team123' }, body: { players: [] } };
                await controller.updateTeam(req, mockRes);
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "Players must be a non-empty array" });
                expect(TeamDao.update).not.toHaveBeenCalled();
            });
        });

        // --- deleteTeam ---
        describe('deleteTeam', () => {
            it('should delete a team with valid ID', async () => {
                const req = { params: { id: 'team123' } };
                TeamDao.del.mockResolvedValue(true);
                await controller.deleteTeam(req, mockRes);
                expect(TeamDao.del).toHaveBeenCalledWith('team123');
                expect(mockRes.status).toBe(200);
                expect(mockRes.send).toEqual({ success: true, message: "Team deleted successfully" });
            });

            it('should return 404 if team to delete is not found', async () => {
                const req = { params: { id: 'badId' } };
                TeamDao.del.mockResolvedValue(null);
                await controller.deleteTeam(req, mockRes);
                expect(mockRes.status).toBe(404);
                expect(mockRes.send).toEqual({ error: "Team not found" });
            });
        });

        // --- addPlayerToTeam ---
        describe('addPlayerToTeam', () => {
            it('should add a player to a team', async () => {
                const req = { params: { id: 'team123' }, body: { playerName: 'New Player' } };
                TeamDao.read.mockResolvedValue(mockTeam);
                const updatedTeam = { ...mockTeam, players: [...mockTeam.players, 'New Player'] };
                TeamDao.update.mockResolvedValue(updatedTeam);

                await controller.addPlayerToTeam(req, mockRes);

                expect(TeamDao.read).toHaveBeenCalledWith('team123');
                expect(TeamDao.update).toHaveBeenCalledWith('team123', { players: ['Player 1', 'Player 2', 'New Player'] });
                expect(mockRes.status).toBe(200);
                expect(mockRes.send.team).toEqual(updatedTeam);
            });

            it('should return 400 if player already exists', async () => {
                const req = { params: { id: 'team123' }, body: { playerName: 'Player 1' } };
                TeamDao.read.mockResolvedValue(mockTeam);
                await controller.addPlayerToTeam(req, mockRes);
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "Player already exists on this team" });
                expect(TeamDao.update).not.toHaveBeenCalled();
            });
        });

        // --- registerTeam ---
        describe('registerTeam', () => {
            it('should register a new team', async () => {
                const req = { body: { teamName: 'New Team', coach: 'Coach Red' } };
                TeamDao.create.mockResolvedValue({ ...mockTeam, ...req.body });

                await controller.registerTeam(req, mockRes);

                expect(TeamDao.create).toHaveBeenCalledWith({
                    coach: 'Coach Red',
                    players: [],
                    games: [],
                    teamName: 'New Team'
                });
                expect(mockRes.status).toBe(200);
                expect(mockRes.send.success).toBe(true);
            });

            // ADDED: Test for null body
            it('should return 400 if req.body is null', async () => {
                const req = { body: null };
                await controller.registerTeam(req, mockRes);
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "Team name is required" }); // This is the first check hit
                expect(TeamDao.create).not.toHaveBeenCalled();
            });

            it('should return 400 if teamName is missing', async () => {
                const req = { body: { coach: 'Coach Red' } };
                await controller.registerTeam(req, mockRes);
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "Team name is required" });
            });

            // ADDED: Test for missing coach
            it('should return 400 if coach is missing', async () => {
                const req = { body: { teamName: 'New Team' } };
                await controller.registerTeam(req, mockRes);
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "Coach name is required" });
                expect(TeamDao.create).not.toHaveBeenCalled();
            });

            // ADDED: Test for empty coach string
            it('should return 400 if coach name is empty string', async () => {
                const req = { body: { teamName: 'New Team', coach: '   ' } };
                await controller.registerTeam(req, mockRes);
                expect(mockRes.status).toBe(400);
                expect(mockRes.send).toEqual({ error: "Coach name cannot be empty" });
                expect(TeamDao.create).not.toHaveBeenCalled();
            });
            
            // ADDED: Test for DAO failure
            it('should return 500 if DAO create fails', async () => {
                const req = { body: { teamName: 'New Team', coach: 'Coach Red' } };
                TeamDao.create.mockRejectedValue(new Error('DB Error'));
                await controller.registerTeam(req, mockRes);
                expect(mockRes.status).toBe(500);
                expect(mockRes.send).toEqual({ error: "Failed to register team" });
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

        // --- exports.register ---
        describe('exports.register', () => {
            it('should redirect to /team.html on successful registration', async () => {
                mockRequest = {
                    body: { teamName: 'New Team', coach: 'New Coach' }
                };
                TeamDao.create.mockResolvedValue({ ...mockTeam, ...mockRequest.body });

                await register(mockRequest, mockResponse);

                expect(TeamDao.create).toHaveBeenCalled();
                expect(mockResponse.redirect).toHaveBeenCalledWith('/team.html');
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should return 400 JSON error if validation fails (missing coach)', async () => {
                mockRequest = {
                    body: { teamName: 'New Team' } // Missing coach
                };
                
                await register(mockRequest, mockResponse);

                expect(TeamDao.create).not.toHaveBeenCalled();
                expect(mockResponse.redirect).not.toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({ error: "Coach name is required" });
            });

            // ADDED: Test for missing teamName
            it('should return 400 JSON error if validation fails (missing teamName)', async () => {
                mockRequest = {
                    body: { coach: 'New Coach' } // Missing teamName
                };
                
                await register(mockRequest, mockResponse);

                expect(TeamDao.create).not.toHaveBeenCalled();
                expect(mockResponse.redirect).not.toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({ error: "Team name is required" });
            });

            // ADDED: Test for empty coach string
            it('should return 400 JSON error if validation fails (empty coach)', async () => {
                mockRequest = {
                    body: { teamName: 'New Team', coach: '   ' } // Empty coach
                };
                
                await register(mockRequest, mockResponse);

                expect(TeamDao.create).not.toHaveBeenCalled();
                expect(mockResponse.redirect).not.toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({ error: "Coach name cannot be empty" });
            });

            // ADDED: Test for 500 error
            it('should return 500 JSON error if DAO create fails', async () => {
                mockRequest = {
                    body: { teamName: 'New Team', coach: 'New Coach' }
                };
                TeamDao.create.mockRejectedValue(new Error('DB Error'));
                
                await register(mockRequest, mockResponse);

                expect(TeamDao.create).toHaveBeenCalled(); // Controller is still called
                expect(mockResponse.redirect).not.toHaveBeenCalled();
                expect(mockResponse.status).toHaveBeenCalledWith(500);
                expect(mockResponse.json).toHaveBeenCalledWith({ error: "Failed to register team" });
            });
        });

        // --- exports.getAll ---
        describe('exports.getAll', () => {
            it('should return all teams as JSON with 200 status', async () => {
                mockRequest = {};
                const teamsArray = [mockTeam];
                TeamDao.readAll.mockResolvedValue(teamsArray);

                await getAll(mockRequest, mockResponse);

                expect(TeamDao.readAll).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith({ success: true, teams: teamsArray });
            });
        });

        /* NOTE: The handlers addPlayer, update, and getById in your controller file
           do NOT send a response back to the client (they don't call res.json, 
           res.send, or res.redirect). This is likely a bug in the controller.
    
           These tests will pass if the controller methods are *called* correctly,
           but they cannot check for a final response.
        */

        // --- exports.addPlayer ---
        describe('exports.addPlayer', () => {
            it('should map teamId from body and call controller', async () => {
                mockRequest = {
                    body: { teamId: 'team123', playerName: 'New Player' },
                    params: {} // Starts empty
                };
                
                // Simulate the DAO calls that addPlayerToTeam will trigger
                TeamDao.read.mockResolvedValue(mockTeam);
                TeamDao.update.mockResolvedValue(mockTeam);

                await addPlayer(mockRequest, mockResponse);

                // Check that the request params were correctly modified for the controller
                expect(mockRequest.params.id).toBe('team123');
                
                // Check that the correct DAO methods were triggered by the controller
                expect(TeamDao.read).toHaveBeenCalledWith('team123');
                expect(TeamDao.update).toHaveBeenCalled();
                
                // We cannot check for res.json() or res.redirect() as the handler doesn't call them
            });
        });

        // --- exports.update ---
        describe('exports.update', () => {
            it('should map updateTeamId from body and call controller', async () => {
                mockRequest = {
                    body: { updateTeamId: 'team123', coach: 'New Coach' },
                    params: {} // Starts empty
                };
                
                TeamDao.update.mockResolvedValue(mockTeam); // Simulate success

                await update(mockRequest, mockResponse);

                // Check that the request params were correctly modified for the controller
                expect(mockRequest.params.id).toBe('team123');
                expect(TeamDao.update).toHaveBeenCalledWith('team123', { coach: 'New Coach' });
            });
        });

        // --- exports.getById ---
        describe('exports.getById', () => {
            it('should call getTeamById controller method', async () => {
                mockRequest = {
                    params: { id: 'team123' }
                };
                
                TeamDao.read.mockResolvedValue(mockTeam); // Simulate success

                await getById(mockRequest, mockResponse);

                expect(TeamDao.read).toHaveBeenCalledWith('team123');
            });
        });
    });
});