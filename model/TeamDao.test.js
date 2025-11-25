const dbcon = require('./DbConnect');
const teamDao = require('./TeamDao');
const mongoose = require('mongoose');

beforeAll(async function(){ 
    await dbcon.connect('test');
});

afterAll(async function(){ 
    await teamDao.deleteAll();
    dbcon.disconnect();
});

beforeEach(async function(){ 
    await teamDao.deleteAll();
});

test('Create new team test', async function(){
    const mockCoachId = new mongoose.Types.ObjectId();
    
    let teamData = {
        teamName: 'Team1',
        id_coach: mockCoachId
    };
    let createdTeam = await teamDao.create(teamData);
    
    expect(createdTeam._id).not.toBeNull();
    expect(createdTeam.teamName).toBe('Team1');
    expect(createdTeam.id_coach).toEqual(mockCoachId);
    expect(createdTeam.createdAt).not.toBeNull();
});

test('Delete team', async function(){
    const mockCoachId = new mongoose.Types.ObjectId();
    
    let teamData = {
        teamName: 'Team1',
        id_coach: mockCoachId
    };
    let team = await teamDao.create(teamData);
    
    let deleted = await teamDao.del(team._id);
    
    let found = await teamDao.read(team._id);
    
    expect(found).toBeNull();
    expect(deleted._id).toEqual(team._id);
});

test('Read all teams', async function(){
    const mockCoach1Id = new mongoose.Types.ObjectId();
    const mockCoach2Id = new mongoose.Types.ObjectId();
    const mockCoach3Id = new mongoose.Types.ObjectId();
    
    await teamDao.create({
        teamName: 'Team1',
        id_coach: mockCoach1Id
    });
    await teamDao.create({
        teamName: 'Team2',
        id_coach: mockCoach2Id
    });
    await teamDao.create({
        teamName: 'Team3',
        id_coach: mockCoach3Id
    });
    
    let allTeams = await teamDao.readAll();
    
    expect(allTeams.length).toBe(3);
});

test('Read team by ID', async function(){
    const mockCoachId = new mongoose.Types.ObjectId();
    
    let teamData = {
        teamName: 'Team1',
        id_coach: mockCoachId
    };
    let createdTeam = await teamDao.create(teamData);
    
    let foundTeam = await teamDao.read(createdTeam._id);
    
    expect(foundTeam).not.toBeNull();
    expect(foundTeam._id).toEqual(createdTeam._id);
    expect(foundTeam.teamName).toBe('Team1');
    expect(foundTeam.id_coach).toEqual(mockCoachId);
});

test('Update team', async function(){
    const mockCoachId = new mongoose.Types.ObjectId();
    
    let teamData = {
        teamName: 'Team1',
        id_coach: mockCoachId
    };
    let createdTeam = await teamDao.create(teamData);
    
    let updates = { teamName: 'Team2' };
    let updatedTeam = await teamDao.update(createdTeam._id, updates);
    
    expect(updatedTeam).not.toBeNull();
    expect(updatedTeam.teamName).toBe('Team2');
    expect(updatedTeam._id).toEqual(createdTeam._id);
});

test('Update team should return null if team does not exist', async function(){
    const nonExistentId = new mongoose.Types.ObjectId();
    
    let updates = { teamName: 'Updated Name' };
    let updatedTeam = await teamDao.update(nonExistentId, updates);
    
    expect(updatedTeam).toBeNull();
});

test('Find team by coach ID', async function(){
    const mockCoach1Id = new mongoose.Types.ObjectId();
    const mockCoach2Id = new mongoose.Types.ObjectId();
    
    await teamDao.create({
        teamName: 'Team1',
        id_coach: mockCoach1Id
    });
    await teamDao.create({
        teamName: 'Team2',
        id_coach: mockCoach2Id
    });
    
    let team = await teamDao.findByCoachId(mockCoach1Id);
    
    expect(team).not.toBeNull();
    expect(team.teamName).toBe('Team1');
    expect(team.id_coach).toEqual(mockCoach1Id);
});

test('Find team by coach ID should return null if not found', async function(){
    const nonExistentCoachId = new mongoose.Types.ObjectId();
    
    let team = await teamDao.findByCoachId(nonExistentCoachId);
    
    expect(team).toBeNull();
});

test('Delete all teams', async function(){
    const mockCoach1Id = new mongoose.Types.ObjectId();
    const mockCoach2Id = new mongoose.Types.ObjectId();
    
    await teamDao.create({
        teamName: 'Team1',
        id_coach: mockCoach1Id
    });
    await teamDao.create({
        teamName: 'Team2',
        id_coach: mockCoach2Id
    });
    
    let teamsBefore = await teamDao.readAll();
    expect(teamsBefore.length).toBe(2);
    
    await teamDao.deleteAll();
    
    let teamsAfter = await teamDao.readAll();
    expect(teamsAfter.length).toBe(0);
});

test('Read team with invalid ID should throw error', async function(){
    const invalidId = 'invalid-id';
    
    await expect(teamDao.read(invalidId)).rejects.toThrow();
});

test('Read team with non-existent ID should return null', async function(){
    const nonExistentId = new mongoose.Types.ObjectId();
    
    let team = await teamDao.read(nonExistentId);
    
    expect(team).toBeNull();
});
