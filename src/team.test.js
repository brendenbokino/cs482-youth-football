// Reece Watkins team tests 

const TeamController = require('./TeamController.js');
const TeamDao = require('../model/TeamDao');

// Mock TeamDao before requiring TeamController
jest.mock('../model/TeamDao', () => ({
    create: jest.fn(),
    readAll: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
    deleteAll: jest.fn()
}));

describe('Team Controller Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ===== CREATE NEW TEAM TESTS ===== //
    test("createNewTeam with valid data", async function () {
        const team = new TeamController();
        
        const mockSavedTeam = {
            _id: "team123",
            players: ["jim", "ray", "Brad"],
            coach: "BOB",
            games: ["metlife", "theGarden"]
        };

        let req = {
            players: ["jim", "ray", "Brad"],
            coach: "BOB",
            games: ["metlife", "theGarden"]
        };

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.create.mockResolvedValue(mockSavedTeam);
        
        await team.createNewTeam(req, res);
        
        expect(TeamDao.create).toHaveBeenCalledWith({
            players: ["jim", "ray", "Brad"],
            coach: "BOB",
            games: ["metlife", "theGarden"]
        });
        expect(res.send.success).toBeTruthy();
        expect(res.send.message).toBe("Team has been created");
        expect(res.send.team.coach).toBe("BOB");
        expect(res.status).toBe(200);
        expect(team.teamData).toEqual(mockSavedTeam);
    });

    test("createNewTeam with null request", async function () {
        const team = new TeamController();
        
        let res = {
            status: 0,
            send: {},
        };

        await team.createNewTeam(null, res);
        
        expect(res.send.error).toBe("Request is empty");
        expect(res.status).toBe(400);
    });

    test("createNewTeam with missing coach", async function () {
        const team = new TeamController();
        
        let req = {
            players: ["jim", "ray", "Brad"]
        };

        let res = {
            status: 0,
            send: {},
        };

        await team.createNewTeam(req, res);
        
        expect(res.send.error).toBe("Team must have a coach and players array");
        expect(res.status).toBe(400);
    });

    test("createNewTeam with missing players", async function () {
        const team = new TeamController();
        
        let req = {
            coach: "BOB"
        };

        let res = {
            status: 0,
            send: {},
        };

        await team.createNewTeam(req, res);
        
        expect(res.send.error).toBe("Team must have a coach and players array");
        expect(res.status).toBe(400);
    });

    test("createNewTeam with empty players array", async function () {
        const team = new TeamController();
        
        let req = {
            players: [],
            coach: "BOB"
        };

        let res = {
            status: 0,
            send: {},
        };

        await team.createNewTeam(req, res);
        
        expect(res.send.error).toBe("Team must have at least one player");
        expect(res.status).toBe(400);
    });

    test("createNewTeam with empty coach name", async function () {
        const team = new TeamController();
        
        let req = {
            players: ["jim", "ray"],
            coach: "   "
        };

        let res = {
            status: 0,
            send: {},
        };

        await team.createNewTeam(req, res);
        
        expect(res.send.error).toBe("Coach name cannot be empty");
        expect(res.status).toBe(400);
    });

    test("createNewTeam with non-array players", async function () {
        const team = new TeamController();
        
        let req = {
            players: "not an array",
            coach: "BOB"
        };

        let res = {
            status: 0,
            send: {},
        };

        await team.createNewTeam(req, res);
        
        expect(res.send.error).toBe("Team must have a coach and players array");
        expect(res.status).toBe(400);
    });

    test("createNewTeam with database error", async function () {
        const team = new TeamController();
        
        let req = {
            players: ["jim", "ray"],
            coach: "BOB"
        };

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.create.mockRejectedValue(new Error("Database error"));
        
        await team.createNewTeam(req, res);
        
        expect(res.send.error).toBe("Failed to create team");
        expect(res.status).toBe(500);
    });

    // ===== GET ALL TEAMS TESTS ===== //
    test("getAllTeams success", async function () {
        const team = new TeamController();
        
        const mockTeams = [
            { _id: "1", players: ["jim"], coach: "BOB", games: [] },
            { _id: "2", players: ["ray"], coach: "TIM", games: [] }
        ];

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.readAll.mockResolvedValue(mockTeams);
        
        await team.getAllTeams({}, res);
        
        expect(TeamDao.readAll).toHaveBeenCalled();
        expect(res.send.success).toBeTruthy();
        expect(res.send.teams).toEqual(mockTeams);
        expect(res.status).toBe(200);
    });

    test("getAllTeams with database error", async function () {
        const team = new TeamController();
        
        let res = {
            status: 0,
            send: {},
        };

        TeamDao.readAll.mockRejectedValue(new Error("Database error"));
        
        await team.getAllTeams({}, res);
        
        expect(res.send.error).toBe("Failed to fetch teams");
        expect(res.status).toBe(500);
    });

    // ===== GET TEAM BY ID TESTS ===== //
    test("getTeamById with valid ID", async function () {
        const team = new TeamController();
        
        const mockTeam = {
            _id: "team123",
            players: ["jim", "ray"],
            coach: "BOB",
            games: []
        };

        let req = {
            params: { id: "team123" }
        };

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.read.mockResolvedValue(mockTeam);
        
        await team.getTeamById(req, res);
        
        expect(TeamDao.read).toHaveBeenCalledWith("team123");
        expect(res.send.success).toBeTruthy();
        expect(res.send.team).toEqual(mockTeam);
        expect(res.status).toBe(200);
    });

    test("getTeamById with missing ID", async function () {
        const team = new TeamController();
        
        let req = {};
        let res = {
            status: 0,
            send: {},
        };

        await team.getTeamById(req, res);
        
        expect(res.send.error).toBe("Team ID is required");
        expect(res.status).toBe(400);
    });

    test("getTeamById with non-existent team", async function () {
        const team = new TeamController();
        
        let req = {
            params: { id: "nonexistent" }
        };

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.read.mockResolvedValue(null);
        
        await team.getTeamById(req, res);
        
        expect(res.send.error).toBe("Team not found");
        expect(res.status).toBe(404);
    });

    // ===== UPDATE TEAM TESTS ===== //
    test("updateTeam with valid data", async function () {
        const team = new TeamController();
        
        const updatedTeam = {
            _id: "team123",
            players: ["jim", "ray", "newPlayer"],
            coach: "NEW_COACH",
            games: ["game1"]
        };

        let req = {
            params: { id: "team123" },
            body: {
                coach: "NEW_COACH",
                players: ["jim", "ray", "newPlayer"],
                games: ["game1"]
            }
        };

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.update.mockResolvedValue(updatedTeam);
        
        await team.updateTeam(req, res);
        
        expect(TeamDao.update).toHaveBeenCalledWith("team123", {
            coach: "NEW_COACH",
            players: ["jim", "ray", "newPlayer"],
            games: ["game1"]
        });
        expect(res.send.success).toBeTruthy();
        expect(res.send.message).toBe("Team updated successfully");
        expect(res.status).toBe(200);
    });

    test("updateTeam with missing ID", async function () {
        const team = new TeamController();
        
        let req = {
            body: { coach: "NEW_COACH" }
        };

        let res = {
            status: 0,
            send: {},
        };

        await team.updateTeam(req, res);
        
        expect(res.send.error).toBe("Team ID is required");
        expect(res.status).toBe(400);
    });

    test("updateTeam with empty coach name", async function () {
        const team = new TeamController();
        
        let req = {
            params: { id: "team123" },
            body: { coach: "   " }
        };

        let res = {
            status: 0,
            send: {},
        };

        await team.updateTeam(req, res);
        
        expect(res.send.error).toBe("Coach name cannot be empty");
        expect(res.status).toBe(400);
    });

    test("updateTeam with empty players array", async function () {
        const team = new TeamController();
        
        let req = {
            params: { id: "team123" },
            body: { players: [] }
        };

        let res = {
            status: 0,
            send: {},
        };

        await team.updateTeam(req, res);
        
        expect(res.send.error).toBe("Players must be a non-empty array");
        expect(res.status).toBe(400);
    });

    // ===== DELETE TEAM TESTS ===== //
    test("deleteTeam with valid ID", async function () {
        const team = new TeamController();
        
        const deletedTeam = {
            _id: "team123",
            players: ["jim", "ray"],
            coach: "BOB"
        };

        let req = {
            params: { id: "team123" }
        };

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.del.mockResolvedValue(deletedTeam);
        
        await team.deleteTeam(req, res);
        
        expect(TeamDao.del).toHaveBeenCalledWith("team123");
        expect(res.send.success).toBeTruthy();
        expect(res.send.message).toBe("Team deleted successfully");
        expect(res.status).toBe(200);
    });

    test("deleteTeam with non-existent team", async function () {
        const team = new TeamController();
        
        let req = {
            params: { id: "nonexistent" }
        };

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.del.mockResolvedValue(null);
        
        await team.deleteTeam(req, res);
        
        expect(res.send.error).toBe("Team not found");
        expect(res.status).toBe(404);
    });

    // ===== DELETE ALL TEAMS TESTS ===== //
    test("deleteAllTeams success", async function () {
        const team = new TeamController();
        
        let res = {
            status: 0,
            send: {},
        };

        TeamDao.deleteAll.mockResolvedValue();
        
        await team.deleteAllTeams({}, res);
        
        expect(TeamDao.deleteAll).toHaveBeenCalled();
        expect(res.send.success).toBeTruthy();
        expect(res.send.message).toBe("All teams deleted successfully");
        expect(res.status).toBe(200);
    });

    // ===== GET TEAMS BY COACH TESTS ===== //
    test("getTeamsByCoach with valid coach", async function () {
        const team = new TeamController();
        
        const allTeams = [
            { _id: "1", players: ["jim"], coach: "BOB", games: [] },
            { _id: "2", players: ["ray"], coach: "TIM", games: [] },
            { _id: "3", players: ["sam"], coach: "BOB_SMITH", games: [] }
        ];

        let req = {
            query: { coach: "BOB" }
        };

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.readAll.mockResolvedValue(allTeams);
        
        await team.getTeamsByCoach(req, res);
        
        expect(res.send.success).toBeTruthy();
        expect(res.send.teams).toHaveLength(2);
        expect(res.send.teams[0].coach).toBe("BOB");
        expect(res.send.teams[1].coach).toBe("BOB_SMITH");
        expect(res.status).toBe(200);
    });

    test("getTeamsByCoach with missing coach parameter", async function () {
        const team = new TeamController();
        
        let req = {};
        let res = {
            status: 0,
            send: {},
        };

        await team.getTeamsByCoach(req, res);
        
        expect(res.send.error).toBe("Coach name is required");
        expect(res.status).toBe(400);
    });

    // ===== ADD PLAYER TO TEAM TESTS ===== //
    test("addPlayerToTeam with valid data", async function () {
        const team = new TeamController();
        
        const existingTeam = {
            _id: "team123",
            players: ["jim", "ray"],
            coach: "BOB",
            games: []
        };

        const updatedTeam = {
            _id: "team123",
            players: ["jim", "ray", "newPlayer"],
            coach: "BOB",
            games: []
        };

        let req = {
            params: { id: "team123" },
            body: { playerName: "newPlayer" }
        };

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.read.mockResolvedValue(existingTeam);
        TeamDao.update.mockResolvedValue(updatedTeam);
        
        await team.addPlayerToTeam(req, res);
        
        expect(TeamDao.read).toHaveBeenCalledWith("team123");
        expect(TeamDao.update).toHaveBeenCalledWith("team123", { 
            players: ["jim", "ray", "newPlayer"] 
        });
        expect(res.send.success).toBeTruthy();
        expect(res.send.message).toBe("Player added successfully");
        expect(res.status).toBe(200);
    });

    test("addPlayerToTeam with existing player", async function () {
        const team = new TeamController();
        
        const existingTeam = {
            _id: "team123",
            players: ["jim", "ray"],
            coach: "BOB",
            games: []
        };

        let req = {
            params: { id: "team123" },
            body: { playerName: "jim" }
        };

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.read.mockResolvedValue(existingTeam);
        
        await team.addPlayerToTeam(req, res);
        
        expect(res.send.error).toBe("Player already exists on this team");
        expect(res.status).toBe(400);
    });

    test("addPlayerToTeam with missing player name", async function () {
        const team = new TeamController();
        
        let req = {
            params: { id: "team123" },
            body: {}
        };

        let res = {
            status: 0,
            send: {},
        };

        await team.addPlayerToTeam(req, res);
        
        expect(res.send.error).toBe("Player name is required");
        expect(res.status).toBe(400);
    });

    test("addPlayerToTeam with non-existent team", async function () {
        const team = new TeamController();
        
        let req = {
            params: { id: "nonexistent" },
            body: { playerName: "newPlayer" }
        };

        let res = {
            status: 0,
            send: {},
        };

        TeamDao.read.mockResolvedValue(null);
        
        await team.addPlayerToTeam(req, res);
        
        expect(res.send.error).toBe("Team not found");
        expect(res.status).toBe(404);
    });
});