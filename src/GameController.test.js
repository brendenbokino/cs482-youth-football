const GameExports = require('../src/GameController.js');
const GameController = GameExports.GameController;
const gameDao = require('../model/GameDao.js');

jest.mock('../model/GameDao.js');

let controller;
let res;

beforeEach(() => {
    controller = new GameController();
    res = { status: null, send: null };
    jest.clearAllMocks();
});


describe("Create New Game", () => {
    test("createNewGame: success", async () => {
        const req = { team1: "Team A", team2: "Team B", date: "2025-10-10" };
        const mockGame = { _id: "g1", ...req };
        gameDao.create.mockResolvedValue(mockGame);

        await controller.createNewGame(req, res);

        expect(gameDao.create).toHaveBeenCalledWith(req);
        expect(res.status).toBe(200);
        expect(res.send).toEqual({ success: true, game: mockGame });
    });

    test("createNewGame: missing one team", async () => {
        const req = { team1: "Team A", team2: null };
        await controller.createNewGame(req, res);

        expect(res.status).toBe(400);
        expect(res.send).toEqual({ error: "There must be at least 2 teams in order to create a game" });
        expect(gameDao.create).not.toHaveBeenCalled();
    });

    test("createNewGame: null request", async () => {
        await controller.createNewGame(null, res);
        expect(res.status).toBe(400);
        expect(res.send).toEqual({ error: "Request is empty" });
    });
});

describe("Get Games", () => {
    test("getAllGames: returns all games", async () => {
        const mockGames = [
            { _id: "g1", team1: "A", team2: "B" },
            { _id: "g2", team1: "C", team2: "D" }
        ];
        gameDao.readAll.mockResolvedValue(mockGames);

        await controller.getAllGames({}, res);

        expect(gameDao.readAll).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.send).toEqual(mockGames);
    });
});

describe("Update Game", () => {
    test("updateGame: success", async () => {
        const req = { id: "g1", team1: "X", team2: "Y", date: "2025-11-01", location: "Field", link: "example.com" };
        const mockGame = { _id: "g1", ...req };
        gameDao.update.mockResolvedValue(mockGame);

        await controller.updateGame(req, res);

        expect(gameDao.update).toHaveBeenCalledWith("g1", expect.objectContaining({
            team1: "X",
            team2: "Y",
            date: "2025-11-01",
            location: "Field",
            link: "example.com"
        }));
        expect(res.status).toBe(200);
        expect(res.send).toEqual({ success: true, game: mockGame });
    });

    test("updateGame: game not found", async () => {
        const req = { id: "g1", team1: "A", team2: "B" };
        gameDao.update.mockResolvedValue(null);

        await controller.updateGame(req, res);

        expect(res.status).toBe(404);
        expect(res.send).toEqual({ error: "Game not found" });
    });

    test("updateGame: missing teams", async () => {
        const req = { id: "g1", team1: null, team2: null };
        await controller.updateGame(req, res);

        expect(res.status).toBe(400);
        expect(res.send).toEqual({ error: "There must be at least 2 teams" });
    });

    test("updateGame: missing id", async () => {
        const req = { team1: "A", team2: "B" };
        await controller.updateGame(req, res);

        expect(res.status).toBe(400);
        expect(res.send).toEqual({ error: "Request is empty or missing game ID" });
    });
});

describe("Delete Games", () => {
    test("deleteGame: success", async () => {
        const req = { id: "g1" };
        gameDao.del.mockResolvedValue(true);

        await controller.deleteGame(req, res);

        expect(gameDao.del).toHaveBeenCalledWith("g1");
        expect(res.status).toBe(200);
        expect(res.send).toEqual({ success: true, message: "Game deleted successfully" });
    });

    test("deleteGame: game not found", async () => {
        const req = { id: "g1" };
        gameDao.del.mockResolvedValue(false);

        await controller.deleteGame(req, res);

        expect(res.status).toBe(404);
        expect(res.send).toEqual({ error: "Game not found" });
    });

    test("deleteGame: missing id", async () => {
        const req = { id: null };
        await controller.deleteGame(req, res);

        expect(res.status).toBe(400);
        expect(res.send).toEqual({ error: "Request is empty or missing game ID" });
    });

    test("deleteAllGames: success", async () => {
        gameDao.deleteAll.mockResolvedValue();
        await controller.deleteAllGames({}, res);

        expect(gameDao.deleteAll).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.send).toEqual({ success: true, message: "All games deleted successfully" });
    });
});

describe("GameController Exported Route Handlers", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
            redirect: jest.fn()
        };
    });

    test("exports.create: JSON request success", async () => {
        const game = { _id: "g1", team1: "A", team2: "B" };
        gameDao.create.mockResolvedValue(game);

        req = {
            body: { team1: "A", team2: "B" },
            headers: { "content-type": "application/json" }
        };

        await GameExports.create(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, game });
    });

    test("exports.create: JSON request missing teams", async () => {
        req = {
            body: { team1: null, team2: null },
            headers: { "content-type": "application/json" }
        };

        await GameExports.create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "There must be at least 2 teams in order to create a game" });
    });

    test("exports.create: form submission redirects on success", async () => {
        const game = { _id: "g1", team1: "A", team2: "B" };
        gameDao.create.mockResolvedValue(game);

        req = {
            body: { team1: "A", team2: "B" },
            headers: { "content-type": "application/x-www-form-urlencoded" }
        };

        await GameExports.create(req, res);

        expect(res.redirect).toHaveBeenCalledWith("/calendar.html");
    });

    test("exports.getAll: returns all games", async () => {
        const mockGames = [{ _id: "g1" }];
        gameDao.readAll.mockResolvedValue(mockGames);

        await GameExports.getAll({}, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockGames);
    });

    test("exports.update: successful update", async () => {
        const mockGame = { _id: "g1", team1: "A", team2: "B" };
        gameDao.update.mockResolvedValue(mockGame);

        req = {
            params: { id: "g1" },
            body: { team1: "A", team2: "B" }
        };

        await GameExports.update(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, game: mockGame });
    });

    test("exports.delete: successful deletion", async () => {
        gameDao.del.mockResolvedValue(true);
        req = { params: { id: "g1" } };

        await GameExports.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: "Game deleted successfully" });
    });

    // ==========================================
// NEW CLASS METHOD TESTS
// ==========================================

describe("Get Single Game By ID (Class Method)", () => {
    test("getGameById: success", async () => {
        const req = { id: "g1" };
        const mockGame = { 
            _id: "g1", 
            team1: "A", 
            team2: "B", 
            team1Score: 10, 
            team2Score: 5,
            playerStats: [1, 2] 
        };
        gameDao.read.mockResolvedValue(mockGame);

        await controller.getGameById(req, res);

        expect(gameDao.read).toHaveBeenCalledWith("g1");
        expect(res.status).toBe(200);
        // Verify it returns the specific structure defined in your log logic
        expect(res.send.game.team1Score).toBe(10);
    });

    test("getGameById: not found", async () => {
        const req = { id: "g999" };
        gameDao.read.mockResolvedValue(null);

        await controller.getGameById(req, res);

        expect(res.status).toBe(404);
        expect(res.send.error).toBe("Game not found");
    });

    test("getGameById: missing id", async () => {
        await controller.getGameById({}, res);
        expect(res.status).toBe(400);
        expect(res.send.error).toContain("missing game ID");
    });
});

describe("Update Scores (Class Method)", () => {
    test("updateScore: success", async () => {
        const req = { id: "g1", team1Score: 10, team2Score: 20 };
        gameDao.update.mockResolvedValue(req);

        await controller.updateScore(req, res);

        expect(gameDao.update).toHaveBeenCalledWith("g1", {
            team1Score: 10,
            team2Score: 20
        });
        expect(res.status).toBe(200);
    });

    test("updateScore: missing ID", async () => {
        await controller.updateScore({ team1Score: 10 }, res);
        expect(res.status).toBe(400);
    });
});

describe("Add Player Stats (Class Method)", () => {
    test("addPlayerStat: validation error", async () => {
        // Missing statType
        const req = { id: "g1", playerId: "p1", value: 1 };
        await controller.addPlayerStat(req, res);
        
        expect(res.status).toBe(400);
        expect(res.send.error).toContain("required");
    });

    test("addPlayerStat: game not found", async () => {
        const req = { id: "g1", playerId: "p1", statType: "goal", value: 1 };
        gameDao.read.mockResolvedValue(null); // Game doesn't exist

        await controller.addPlayerStat(req, res);
        
        expect(res.status).toBe(404);
    });

    test("addPlayerStat: successfully appends to existing stats", async () => {
        const req = { id: "g1", playerId: "p1", statType: "goal", value: 1 };
        
        // Mock existing game with 1 stat already
        const existingGame = { 
            _id: "g1", 
            playerStats: [{ existing: true }] 
        };
        
        gameDao.read.mockResolvedValue(existingGame);
        gameDao.update.mockResolvedValue(true);

        await controller.addPlayerStat(req, res);

        // Verify we read the game first
        expect(gameDao.read).toHaveBeenCalledWith("g1");
        
        // Verify we updated with the OLD stat + NEW stat
        expect(gameDao.update).toHaveBeenCalledWith("g1", expect.objectContaining({
            playerStats: expect.arrayContaining([
                { existing: true }, // Old one
                expect.objectContaining({ statType: "goal", value: 1 }) // New one
            ])
        }));
        expect(res.status).toBe(200);
    });
});

// ==========================================
// NEW WRAPPER TESTS (Admin & Routing)
// ==========================================

describe("GameController Exports - Admin Security", () => {
    
    // --- Update Score Security ---
    test("exports.updateScore: Rejects non-admins (403)", async () => {
        req = { 
            session: { user: { permission: 1 } }, // 1 = Standard User
            body: { id: "g1" } 
        };
        
        await GameExports.updateScore(req, res);
        
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/Unauthorized/) }));
    });

    test("exports.updateScore: Rejects missing session", async () => {
        req = {}; // No session object
        await GameExports.updateScore(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    test("exports.updateScore: Allows Admin (Permission 0)", async () => {
        req = { 
            session: { user: { permission: 0 } }, // 0 = Admin
            body: { id: "g1", team1Score: 5 } 
        };
        gameDao.update.mockResolvedValue({ _id: "g1" });

        await GameExports.updateScore(req, res);
        
        // Should pass through to controller and return 200
        expect(res.status).toHaveBeenCalledWith(200);
    });

    // --- Add Player Stat Security ---
    test("exports.addPlayerStat: Rejects non-admins", async () => {
        req = { 
            session: { user: { permission: 1 } },
            body: { id: "g1" } 
        };
        await GameExports.addPlayerStat(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });
});

describe("GameController Exports - ID Handling", () => {
    
    test("exports.getById: Extracts ID from params", async () => {
        req = { params: { id: "paramId" } };
        gameDao.read.mockResolvedValue({ _id: "paramId" });

        await GameExports.getById(req, res);

        expect(gameDao.read).toHaveBeenCalledWith("paramId");
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("exports.getById: Extracts ID from body (fallback)", async () => {
        req = { params: {}, body: { id: "bodyId" } };
        gameDao.read.mockResolvedValue({ _id: "bodyId" });

        await GameExports.getById(req, res);

        expect(gameDao.read).toHaveBeenCalledWith("bodyId");
    });

    test("exports.getById: Returns 400 if ID missing everywhere", async () => {
        req = { params: {}, body: {} };
        
        await GameExports.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });
});
});

