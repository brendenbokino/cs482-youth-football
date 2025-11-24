const dbcon = require('./DbConnect');
const teamInviteDao = require('./TeamInviteDao');
const { default: expect } = require('expect');
const mongoose = require('mongoose');

beforeAll(async function(){ 
    await dbcon.connect('test');
});

afterAll(async function(){ 
    await teamInviteDao.deleteAll();
    dbcon.disconnect();
});

beforeEach(async function(){ 
    await teamInviteDao.deleteAll();
});

test('Create new team invite test', async function(){
    // Mock ObjectIds for youth and team
    const mockYouthId = new mongoose.Types.ObjectId();
    const mockTeamId = new mongoose.Types.ObjectId();
    
    // Create team invite
    let inviteData = {
        id_youth: mockYouthId,
        id_team: mockTeamId
    };
    let createdInvite = await teamInviteDao.create(inviteData);
    
    // Assertions
    expect(createdInvite._id).not.toBeNull();
    expect(createdInvite.id_youth).toEqual(mockYouthId);
    expect(createdInvite.id_team).toEqual(mockTeamId);
    expect(createdInvite.createdAt).not.toBeNull();
});

test('Delete team invite', async function(){
    // Mock IDs
    const mockYouthId = new mongoose.Types.ObjectId();
    const mockTeamId = new mongoose.Types.ObjectId();
    
    // Create invite
    let inviteData = {
        id_youth: mockYouthId,
        id_team: mockTeamId
    };
    let invite = await teamInviteDao.create(inviteData);
    
    // Delete invite
    let deleted = await teamInviteDao.del(invite._id);
    
    // Try to find deleted invite
    let found = await teamInviteDao.read(invite._id);
    
    expect(found).toBeNull();
    expect(deleted._id).toEqual(invite._id);
});

test('Read all team invites', async function(){
    // Mock IDs
    const mockTeamId = new mongoose.Types.ObjectId();
    const mockYouth1Id = new mongoose.Types.ObjectId();
    const mockYouth2Id = new mongoose.Types.ObjectId();
    const mockYouth3Id = new mongoose.Types.ObjectId();
    
    // Create invites for all 3 youths
    await teamInviteDao.create({
        id_youth: mockYouth1Id,
        id_team: mockTeamId
    });
    await teamInviteDao.create({
        id_youth: mockYouth2Id,
        id_team: mockTeamId
    });
    await teamInviteDao.create({
        id_youth: mockYouth3Id,
        id_team: mockTeamId
    });
    
    let allInvites = await teamInviteDao.readAll();
    
    expect(allInvites.length).toBe(3);
});

test('Read team invite by ID', async function(){
    // Mock IDs
    const mockYouthId = new mongoose.Types.ObjectId();
    const mockTeamId = new mongoose.Types.ObjectId();
    
    // Create invite
    let inviteData = {
        id_youth: mockYouthId,
        id_team: mockTeamId
    };
    let createdInvite = await teamInviteDao.create(inviteData);
    
    // Read invite
    let foundInvite = await teamInviteDao.read(createdInvite._id);
    
    expect(foundInvite).not.toBeNull();
    expect(foundInvite._id).toEqual(createdInvite._id);
    expect(foundInvite.id_youth).toEqual(mockYouthId);
    expect(foundInvite.id_team).toEqual(mockTeamId);
});

test('Get invites by youth ID', async function(){
    // Mock IDs
    const mockYouthId = new mongoose.Types.ObjectId();
    const mockTeam1Id = new mongoose.Types.ObjectId();
    const mockTeam2Id = new mongoose.Types.ObjectId();
    
    // Create 2 invites for the same youth to different teams
    await teamInviteDao.create({
        id_youth: mockYouthId,
        id_team: mockTeam1Id
    });
    await teamInviteDao.create({
        id_youth: mockYouthId,
        id_team: mockTeam2Id
    });
    
    // Get invites by youth ID
    let youthInvites = await teamInviteDao.getInvitesByYouthId(mockYouthId);
    
    expect(youthInvites.length).toBe(2);
    expect(youthInvites[0].id_youth).toEqual(mockYouthId);
    expect(youthInvites[1].id_youth).toEqual(mockYouthId);
});

test('Get invites by team ID', async function(){
    // Mock IDs
    const mockTeamId = new mongoose.Types.ObjectId();
    const mockYouth1Id = new mongoose.Types.ObjectId();
    const mockYouth2Id = new mongoose.Types.ObjectId();
    
    // Create 2 invites for different youths to the same team
    await teamInviteDao.create({
        id_youth: mockYouth1Id,
        id_team: mockTeamId
    });
    await teamInviteDao.create({
        id_youth: mockYouth2Id,
        id_team: mockTeamId
    });
    
    // Get invites by team ID
    let teamInvites = await teamInviteDao.getInvitesByTeamId(mockTeamId);
    
    expect(teamInvites.length).toBe(2);
    expect(teamInvites[0].id_team).toEqual(mockTeamId);
    expect(teamInvites[1].id_team).toEqual(mockTeamId);
});

test('Delete all team invites', async function(){
    // Mock IDs
    const mockTeamId = new mongoose.Types.ObjectId();
    const mockYouth1Id = new mongoose.Types.ObjectId();
    const mockYouth2Id = new mongoose.Types.ObjectId();
    
    // Create invites
    await teamInviteDao.create({
        id_youth: mockYouth1Id,
        id_team: mockTeamId
    });
    await teamInviteDao.create({
        id_youth: mockYouth2Id,
        id_team: mockTeamId
    });
    
    // Verify invites exist
    let invitesBefore = await teamInviteDao.readAll();
    expect(invitesBefore.length).toBe(2);
    
    // Delete all invites
    await teamInviteDao.deleteAll();
    
    // Verify all deleted
    let invitesAfter = await teamInviteDao.readAll();
    expect(invitesAfter.length).toBe(0);
});
