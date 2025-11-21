// this will define the logic for our Game model 
const gameDao = require('../model/GameDao.js');


// must add ids for game and teams that was causing the errors 

class GameController {
    constructor() { 
        this.gameData = {};
    }

    /// We need functions to create a game 
    async createNewGame(req, res) {
        if (req != null) {
            if (req.team1 != null && req.team2 != null) {
                const gameDate = new Date(req.date);
                const startTime = new Date(`${req.date}T${req.startTime}:00`);
                const endTime = new Date(`${req.date}T${req.endTime}:00`);

                const game = await gameDao.create({
                    team1: req.team1,
                    team2: req.team2,
                    date: gameDate,
                    startTime: startTime,
                    endTime: endTime,
                    location: req.location,
                    link: req.link
                });

                this.gameData = game;
                res.status = 200;
                res.send = { success: true, game: game };
            } else {
                res.status = 400;
                res.send = { error: "There must be at least 2 teams in order to create a game" };
            }
        } else {
            res.status = 400;
            res.send = { error: "Request is empty" };
        }
    }

    // fetch all games function. 
    // no params needed just return what's in the Game data base
    async getAllGames(req, res) {
       
        let allGames = await gameDao.readAll();
        res.status = 200;
        res.send = allGames;

        
        
        
    }


    // delete all function -- great for a testing environment 
    async deleteAllGames(req, res) {
       
        await gameDao.deleteAll();
        res.status = 200;
        res.send = { success: true, message: "All games deleted successfully" };
        
    }

    // update a single game by id
    async updateGame(req, res) {
        if (req != null && req.id != null) {
            if (req.team1 != null && req.team2 != null) {
                const updateData = {
                    team1: req.team1,
                    team2: req.team2,
                    date: req.date,
                    location: req.location,
                    link: req.link,
                    startTime: req.startTime,
                    endTime: req.endTime,
                    _id: req.id
                };
                let game = await gameDao.update(req.id, updateData);
                if (game) {
                    res.status = 200;
                    res.send = { success: true, game: game };
                } else {
                    res.status = 404;
                    res.send = { error: "Game not found" };
                }
            } else {
                res.status = 400;
                res.send = { error: "There must be at least 2 teams" };
            }
        } else {
            res.status = 400;
            res.send = { error: "Request is empty or missing game ID" };
        }
    }

    // delete a single game by id
    async deleteGame(req, res) {
        if (req != null && req.id != null) {
            let game = await gameDao.del(req.id);
            if (game) {
                res.status = 200;
                res.send = { success: true, message: "Game deleted successfully" };
            } else {
                res.status = 404;
                res.send = { error: "Game not found" };
            }
        } else {
            res.status = 400;
            res.send = { error: "Request is empty or missing game ID" };
        }
    }

    // Get a single game by id
    async getGameById(req, res) {
        console.log('GameController.getGameById: Request received');
        console.log('GameController.getGameById: Request data:', req);
        
        if (req != null && req.id != null) {
            console.log('GameController.getGameById: Looking up game with ID:', req.id);
            let game = await gameDao.read(req.id);
            
            if (game) {
                console.log('GameController.getGameById: Game found successfully');
                console.log('GameController.getGameById: Game data:', {
                    _id: game._id,
                    team1: game.team1,
                    team2: game.team2,
                    team1Score: game.team1Score,
                    team2Score: game.team2Score,
                    playerStatsCount: game.playerStats ? game.playerStats.length : 0
                });
                res.status = 200;
                res.send = { success: true, game: game };
            } else {
                console.log('GameController.getGameById: Game not found for ID:', req.id);
                res.status = 404;
                res.send = { error: "Game not found" };
            }
        } else {
            console.log('GameController.getGameById: Invalid request - missing ID');
            console.log('GameController.getGameById: Request was:', req);
            res.status = 400;
            res.send = { error: "Request is empty or missing game ID" };
        }
    }

    // Update game score (admin only)
    async updateScore(req, res) {
        if (req != null && req.id != null) {
            const updateData = {};
            if (req.team1Score !== undefined) {
                updateData.team1Score = parseInt(req.team1Score) || 0;
            }
            if (req.team2Score !== undefined) {
                updateData.team2Score = parseInt(req.team2Score) || 0;
            }
            
            let game = await gameDao.update(req.id, updateData);
            if (game) {
                res.status = 200;
                res.send = { success: true, game: game };
            } else {
                res.status = 404;
                res.send = { error: "Game not found" };
            }
        } else {
            res.status = 400;
            res.send = { error: "Request is empty or missing game ID" };
        }
    }

    // Add player stat to game (admin only)
    async addPlayerStat(req, res) {
        if (req != null && req.id != null) {
            if (!req.playerId || !req.statType || req.value === undefined) {
                res.status = 400;
                res.send = { error: "playerId, statType, and value are required" };
                return;
            }

            // Get current game
            let game = await gameDao.read(req.id);
            if (!game) {
                res.status = 404;
                res.send = { error: "Game not found" };
                return;
            }

            // Add new stat
            const newStat = {
                playerId: req.playerId,
                statType: req.statType, // e.g., "points", "assists", "rebounds", "goals", etc.
                value: req.value,
                timestamp: new Date().toISOString()
            };

            // Get current playerStats array or initialize it
            const playerStats = game.playerStats || [];
            playerStats.push(newStat);

            // Update game with new stats
            const updateData = { playerStats: playerStats };
            let updatedGame = await gameDao.update(req.id, updateData);
            
            if (updatedGame) {
                res.status = 200;
                res.send = { success: true, game: updatedGame };
            } else {
                res.status = 500;
                res.send = { error: "Failed to update game stats" };
            }
        } else {
            res.status = 400;
            res.send = { error: "Request is empty or missing game ID" };
        }
    }

}


// Export handlers
exports.create = async function(req, res) {
    const controller = new GameController();
    // Map form body to expected shape
    const mockReq = req && req.body ? {
        team1: req.body.team1,
        team2: req.body.team2,
        date: req.body.date,
        location: req.body.location,
        link: req.body.link,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        _id: req.body._id
    } : null;
    const mockRes = { status: null, send: null };
    await controller.createNewGame(mockReq, mockRes);
    
    // For form submissions, redirect. For API calls, send JSON.
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    } else {
        if (mockRes.status === 200) {
            res.redirect('/calendar.html');
        } else {
            res.status(mockRes.status || 500).send(mockRes.send?.error || 'Unknown error');
        }
    }
    return;
}

exports.getAll = async function(req, res) {
    const controller = new GameController();
    const mockRes = { status: null, send: null };
    await controller.getAllGames({}, mockRes);
    res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    return;
}

exports.update = async function(req, res) {
    const controller = new GameController();
    const mockReq = req && req.body ? {
        id: req.params.id || req.body.id,
        team1: req.body.team1,
        team2: req.body.team2,
        date: req.body.date,
        location: req.body.location,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        link: req.body.link
    } : null;
    const mockRes = { status: null, send: null };
    await controller.updateGame(mockReq, mockRes);
    res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    return;
}

exports.delete = async function(req, res) {
    const controller = new GameController();
    const mockReq = req ? {
        id: req.params.id || req.body.id
    } : null;
    const mockRes = { status: null, send: null };
    await controller.deleteGame(mockReq, mockRes);
    res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    return;
}

exports.getById = async function(req, res) {
    console.log('GameController.getById (exports): Request received');
    console.log('GameController.getById (exports): URL params:', req.params);
    console.log('GameController.getById (exports): Request body:', req.body);
    
    const controller = new GameController();
    const gameId = req.params.id || req.body.id;
    console.log('GameController.getById (exports): Extracted game ID:', gameId);
    
    const mockReq = req ? {
        id: gameId
    } : null;
    
    if (!mockReq || !mockReq.id) {
        console.log('GameController.getById (exports): No game ID provided');
        return res.status(400).json({ error: 'Game ID is required' });
    }
    
    const mockRes = { status: null, send: null };
    await controller.getGameById(mockReq, mockRes);
    
    console.log('GameController.getById (exports): Response status:', mockRes.status);
    console.log('GameController.getById (exports): Response data:', mockRes.send);
    
    res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    return;
}

exports.updateScore = async function(req, res) {
    // Check if user is admin (permission 0)
    if (!req.session || !req.session.user || req.session.user.permission !== 0) {
        return res.status(403).json({ error: "Unauthorized. Admin access required." });
    }

    const controller = new GameController();
    const mockReq = req && req.body ? {
        id: req.params.id || req.body.id,
        team1Score: req.body.team1Score,
        team2Score: req.body.team2Score
    } : null;
    const mockRes = { status: null, send: null };
    await controller.updateScore(mockReq, mockRes);
    res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    return;
}

exports.addPlayerStat = async function(req, res) {
    // Check if user is admin (permission 0)
    if (!req.session || !req.session.user || req.session.user.permission !== 0) {
        return res.status(403).json({ error: "Unauthorized. Admin access required." });
    }

    const controller = new GameController();
    const mockReq = req && req.body ? {
        id: req.params.id || req.body.id,
        playerId: req.body.playerId,
        statType: req.body.statType,
        value: req.body.value
    } : null;
    const mockRes = { status: null, send: null };
    await controller.addPlayerStat(mockReq, mockRes);
    res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    return;
}

module.exports.GameController = GameController;
