const TeamDao = require('./TeamDao');
const mongoose = require('mongoose');

// 1. Mock Mongoose completely
jest.mock('mongoose', () => {
    const mockedModel = {
        create: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        findOneAndDelete: jest.fn(),
        find: jest.fn(),
        deleteMany: jest.fn(),
        hydrate: jest.fn((doc) => doc), // Mock hydrate to just return the doc
        // Mock the native collection property used in your specific logic
        collection: {
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn()
        }
    };
    
    return {
        Schema: jest.fn(),
        model: jest.fn(() => mockedModel),
        Types: {
            ObjectId: {
                isValid: jest.fn(() => true), // Always say IDs are valid for tests
                // Mock the constructor
                prototype: {} 
            }
        },
        // Make sure new mongoose.Types.ObjectId returns something manageable
        // We use a factory function here for the constructor
    };
});

// Helper to get the mocked model instance
const mockTeamModel = mongoose.model(); 

// Mock Data
const standardId = 'team_bears_2024'; // A custom string ID
const hexId = '507f1f77bcf86cd799439011'; // A valid 24-char Hex ID
const teamData = { _id: standardId, coach: 'Test Coach', teamName: 'Bears', players: [] };

describe('TeamDAO Implementation Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Default behavior for Types.ObjectId constructor mock
        mongoose.Types.ObjectId = jest.fn(val => val); 
        mongoose.Types.ObjectId.isValid = jest.fn(() => true);
    });

    // --- Standard Tests (Happy Path) ---

    test('Create should call model.create', async () => {
        mockTeamModel.create.mockResolvedValue(teamData);
        
        const result = await TeamDao.create(teamData);
        
        expect(mockTeamModel.create).toHaveBeenCalledWith(teamData);
        expect(result).toEqual(teamData);
    });

    test('ReadAll should return all teams', async () => {
        const list = [teamData];
        mockTeamModel.find.mockResolvedValue(list);
        
        const result = await TeamDao.readAll();
        
        expect(mockTeamModel.find).toHaveBeenCalledWith({});
        expect(result).toEqual(list);
    });

    // --- Logic Tests: The "Custom ID" Handling ---

    test('Read: Should use findOne (Mongoose) for non-hex custom IDs', async () => {
        // Scenario: ID is "team_bears", not a 24-char hex
        mockTeamModel.findOne.mockResolvedValue(teamData);

        await TeamDao.read(standardId);

        // Expect it to SKIP the native collection logic and go straight to mongoose findOne
        expect(mockTeamModel.collection.findOne).not.toHaveBeenCalled();
        expect(mockTeamModel.findOne).toHaveBeenCalledWith({ _id: standardId });
    });

    test('Read: Should use collection.findOne (Native) for valid Hex/ObjectIDs', async () => {
        // Scenario: ID looks like an ObjectId
        mockTeamModel.collection.findOne.mockResolvedValue(teamData);

        await TeamDao.read(hexId);

        // Expect it to use the native collection, NOT the standard mongoose findOne
        expect(mockTeamModel.collection.findOne).toHaveBeenCalled();
        expect(mockTeamModel.hydrate).toHaveBeenCalledWith(teamData);
    });

    test('Read: Fallback - If Hex ID is not found as ObjectId, try as String', async () => {
        // Scenario: ID looks like ObjectId, but was saved as a String in DB
        
        // First attempt (ObjectId) returns null
        mockTeamModel.collection.findOne.mockReturnValueOnce(null);
        // Second attempt (String) returns data
        mockTeamModel.collection.findOne.mockReturnValueOnce(teamData);

        await TeamDao.read(hexId);

        // Should be called twice: once for ObjectId, once for String
        expect(mockTeamModel.collection.findOne).toHaveBeenCalledTimes(2);
    });
    // --- Cover the "Fallback" Logic (Hex ID valid, but doc not found by ObjectId) ---
    
    test('Update: Should fallback to String lookup if ObjectId lookup fails', async () => {
        // Scenario: ID is a valid Hex, but DB returns null for ObjectId query
        const hexId = '507f1f77bcf86cd799439011';
        const updateData = { coach: 'New' };
        
        // 1. First call (ObjectId) returns null
        mockTeamModel.collection.findOneAndUpdate.mockReturnValueOnce({ value: null });
        // 2. Second call (String) returns the document
        mockTeamModel.collection.findOneAndUpdate.mockReturnValueOnce({ value: { ...teamData, ...updateData } });

        await TeamDao.update(hexId, updateData);

        // Verify it tried twice
        expect(mockTeamModel.collection.findOneAndUpdate).toHaveBeenCalledTimes(2);
    });

    test('Delete: Should fallback to String lookup if ObjectId lookup fails', async () => {
        const hexId = '507f1f77bcf86cd799439011';
        
        // 1. First call (ObjectId) returns null
        mockTeamModel.collection.findOneAndDelete.mockReturnValueOnce({ value: null });
        // 2. Second call (String) returns the document
        mockTeamModel.collection.findOneAndDelete.mockReturnValueOnce({ value: teamData });

        await TeamDao.del(hexId);

        expect(mockTeamModel.collection.findOneAndDelete).toHaveBeenCalledTimes(2);
    });

    // --- Cover the "Not Found" scenarios to hit the null checks ---

    test('Read: Should return null if neither ObjectId nor String ID is found', async () => {
        const hexId = '507f1f77bcf86cd799439011';
        // Both attempts return null
        mockTeamModel.collection.findOne.mockResolvedValue(null); 
        
        const result = await TeamDao.read(hexId);
        expect(result).toBeNull();
    });

    test('Update: Should return null if Hex ID not found via native collection', async () => {
        const hexId = '507f1f77bcf86cd799439011';
        mockTeamModel.collection.findOneAndUpdate.mockResolvedValue({ value: null }); // Null for both calls
        
        const result = await TeamDao.update(hexId, { coach: 'A' });
        expect(result).toBeNull();
    });

    // --- Logic Tests: Update Handling ---

    test('Update: Should use native findOneAndUpdate for Hex IDs', async () => {
        const updateData = { coach: 'New Coach' };
        const mockResult = { value: { ...teamData, ...updateData } };
        
        mockTeamModel.collection.findOneAndUpdate.mockResolvedValue(mockResult);

        await TeamDao.update(hexId, updateData);

        expect(mockTeamModel.collection.findOneAndUpdate).toHaveBeenCalled();
        // Verify we requested the document after update
        expect(mockTeamModel.collection.findOneAndUpdate).toHaveBeenCalledWith(
            expect.anything(), 
            { $set: updateData }, 
            { returnDocument: 'after' }
        );
    });

    test('Update: Should use standard findOneAndUpdate for Custom String IDs', async () => {
        const updateData = { coach: 'New Coach' };
        mockTeamModel.findOneAndUpdate.mockResolvedValue({ ...teamData, ...updateData });

        await TeamDao.update(standardId, updateData);

        // Should use the standard mongoose method, not the native collection
        expect(mockTeamModel.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: standardId },
            updateData,
            { new: true }
        );
    });

    // --- Logic Tests: Delete Handling ---

    test('Delete: Should use native findOneAndDelete for Hex IDs', async () => {
        const mockResult = { value: teamData };
        mockTeamModel.collection.findOneAndDelete.mockResolvedValue(mockResult);

        await TeamDao.del(hexId);

        expect(mockTeamModel.collection.findOneAndDelete).toHaveBeenCalled();
        expect(mockTeamModel.hydrate).toHaveBeenCalled();
    });

    test('Delete: Should use standard findOneAndDelete for Custom String IDs', async () => {
        mockTeamModel.findOneAndDelete.mockResolvedValue(teamData);

        await TeamDao.del(standardId);

        expect(mockTeamModel.findOneAndDelete).toHaveBeenCalledWith({ _id: standardId });
    });
});