const TeamDao = require('./TeamDao');


jest.mock('./TeamDao', () => ({
    create: jest.fn(),
    readAll: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
    deleteAll: jest.fn()
}));

// Mock Data
const teamId = 'team123';
const teamData = { coach: 'Test Coach', players: ['Player 1'], teamName: 'Bears', games: [], record: [0,0]};
const updatedTeamData = { coach: 'New Coach', players: ['Player 1', 'Player 2'], teamName: 'Bears', games: [], record: [1,0]};
const teamList = [teamData, { coach: 'Other Coach', players: [], teamName: 'Lions', games: [], record: [0,1]}];

describe('TeamDAO Mock Tests', () => {
    // Clears the mock history (how many times it was called, with what arguments)
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Create Test ---
    test('Create new team', async function() {
        // Setup mock return value
        TeamDao.create.mockResolvedValue(teamData);

        // Execute the function under test (assuming another module calls this)
        let team = await TeamDao.create(teamData);
    
        // Assertions
        expect(TeamDao.create).toHaveBeenCalledTimes(1);
        expect(TeamDao.create).toHaveBeenCalledWith(teamData);
        expect(team).toEqual(teamData);
    });

    // --- Read All Test ---
    test('Read all teams', async function() {
        // Setup mock return value
        TeamDao.readAll.mockResolvedValue(teamList);

        // Execute
        let teams = await TeamDao.readAll();
    
        // Assertions
        expect(TeamDao.readAll).toHaveBeenCalledTimes(1);
        expect(teams).toEqual(teamList);
        expect(teams.length).toBe(2);
    });

    // --- Read Single Test ---
    test('Read a single team by ID', async function() {
        // Setup mock return value
        TeamDao.read.mockResolvedValue(teamData);

        // Execute
        let team = await TeamDao.read(teamId);
    
        // Assertions
        expect(TeamDao.read).toHaveBeenCalledTimes(1);
        expect(TeamDao.read).toHaveBeenCalledWith(teamId);
        expect(team).toEqual(teamData);
    });

    // --- Update Test ---
    test('Update an existing team', async function() {
        // Setup mock return value (often returns the updated document)
        TeamDao.update.mockResolvedValue(updatedTeamData);

        // Execute
        let updatedTeam = await TeamDao.update(teamId, { coach: 'New Coach', players: ['Player 2'] });
    
        // Assertions
        expect(TeamDao.update).toHaveBeenCalledTimes(1);
        // Check if it was called with the correct ID and the update object
        expect(TeamDao.update).toHaveBeenCalledWith(teamId, { coach: 'New Coach', players: ['Player 2'] });
        expect(updatedTeam).toEqual(updatedTeamData);
    });

    // --- Delete Single Test ---
    test('Delete a single team by ID', async function() {
        // Setup mock return value (e.g., confirmation object or the deleted document)
        TeamDao.del.mockResolvedValue({ deletedCount: 1 });

        // Execute
        let result = await TeamDao.del(teamId);
    
        // Assertions
        expect(TeamDao.del).toHaveBeenCalledTimes(1);
        expect(TeamDao.del).toHaveBeenCalledWith(teamId);
        expect(result).toEqual({ deletedCount: 1 });
    });

    // --- Delete All Test ---
    test('Delete all teams', async function() {
        // Setup mock return value
        TeamDao.deleteAll.mockResolvedValue({ deletedCount: 2 }); // Assuming 2 were deleted

        // Execute
        let result = await TeamDao.deleteAll();
    
        // Assertions
        expect(TeamDao.deleteAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ deletedCount: 2 });
    });
});