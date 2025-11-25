// this will define the logic for our Game model 
const gameDao = require('../model/GameDao.js');
const TeamDao = require('../model/TeamDao');
const YouthGameRecordDao = require('../model/YouthGameRecordDao');
const YouthDao = require('../model/YouthDao');

// must add ids for game and teams that was causing the errors 

class GameController {
    constructor() { 
        this.gameData = {};
    }

    /// We need functions to create a game 
    async createNewGame(req, res) {
        if (req != null) {
            // check request quality 
            // neither should be null a game doesn't have 1 team thats not a game
            if (req.team1_id != null && req.team2_id != null) {
                // if this is true then construct a new game object
                
                let game = await gameDao.create(req);
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
            if (req.id_team1 != null && req.id_team2 != null) {
                const updateData = {
                    id_team1: req.id_team1,
                    id_team2: req.id_team2,
                    date: req.date,
                    location: req.location,
                    link: req.link,
                    startTime: req.startTime,
                    endTime: req.endTime
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
                    id_team1: game.id_team1,
                    id_team2: game.id_team2,
                    date: game.date,
                    location: game.location,
                    link: game.link
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

    async getGameStats(req, res) {
        if (req != null && req.id != null) {
            let gameRecords = await YouthGameRecordDao.getGameRecords(req.id);
            res.status = 200;
            res.send = { success: true, stats: gameRecords };
        } else {
            res.status = 400;
            res.send = { error: "Request is empty or missing game ID" };
        }
    }

    async getGameScore(req, res) {
        if (req != null && req.id != null) {
            let gameRecords = await YouthGameRecordDao.getGameRecords(req.id);
            let gameScore = {
                            team1Score: {
                                id_team: null, score: 0
                                },
                            team2Score: {
                                id_team: null, score: 0
                            }};
            for (let record of gameRecords) {
                let youth = await YouthDao.read(record.id_youth);
                let teamId = youth.id_team; 
                let totalPoints = (record.rushing_tds + record.receiving_tds) * 6; // Passing TDs and Receiving TDs count as one collective td, just that 2 players get credit
                if (gameScore.team1Score.id_team == null) {
                    gameScore.team1Score.id_team = teamId;
                } else if (gameScore.team2Score.id_team == null && teamId !== gameScore.team1Score.id_team) {
                    gameScore.team2Score.id_team = teamId;
                }

                if (teamId === gameScore.team1Score.id_team) {
                    gameScore.team1Score.score += totalPoints;
                } else if (teamId === gameScore.team2Score.id_team) {
                    gameScore.team2Score.score += totalPoints;
                }
            }
            res.status = 200;
            res.send = gameScore;
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
        id_team1: req.body.team1_id,
        id_team2: req.body.team2_id,
        date: req.body.date,
        location: req.body.location,
        link: req.body.link,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
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
    try {
        const gameDao = require('../model/GameDao.js');
        const TeamDao = require('../model/TeamDao.js');
        
        let allGames = await gameDao.readAll();
        
        // Populate team names
        let gamesWithTeamNames = [];
        for (let game of allGames) {
            let team1Name = 'Unknown Team';
            let team2Name = 'Unknown Team';
            
            if (game.id_team1) {
                const team1 = await TeamDao.read(game.id_team1);
                if (team1) team1Name = team1.teamName;
            }
            
            if (game.id_team2) {
                const team2 = await TeamDao.read(game.id_team2);
                if (team2) team2Name = team2.teamName;
            }
            
            gamesWithTeamNames.push({
                _id: game._id,
                team1: team1Name,
                team2: team2Name,
                id_team1: game.id_team1,
                id_team2: game.id_team2,
                date: game.date,
                location: game.location,
                startTime: game.startTime,
                endTime: game.endTime,
                link: game.link
            });
        }
        
        res.status(200).json({ games: gamesWithTeamNames });
    } catch (error) {
        console.error('getAll games error:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
}

exports.update = async function(req, res) {
    const controller = new GameController();
    const mockReq = req && req.body ? {
        id: req.params.id || req.body.id,
        id_team1: req.body.id_team1,
        id_team2: req.body.id_team2,
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

exports.getGameScore = async function(req, res) {
    const controller = new GameController();
    const mockReq = req ? {
        id: req.params.id || req.body.id
    } : null;
    const mockRes = { status: null, send: null };
    await controller.getGameScore(mockReq, mockRes);
    res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    return;
}

exports.getGameStats = async function(req, res) {
    const controller = new GameController();
    const mockReq = req ? {
        id: req.params.id || req.body.id
    } : null;
    const mockRes = { status: null, send: null };
    await controller.getGameStats(mockReq, mockRes);
    res.status(mockRes.status || 500).json(mockRes.send || { error: 'Unknown error' });
    return;
}

module.exports.GameController = GameController;
