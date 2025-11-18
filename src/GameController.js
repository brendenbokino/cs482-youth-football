// this will define the logic for our Game model 
const gameDao = require('../model/GameDao.js');


// must add ids for game and teams that was causing the errors 

class GameController {
    constructor() { 
        this.gameData = {};
    }

    /// We need functions to create a game 
    async createNewGame(req, res) {
        // create a payload to match our intended schema 
        // here we can also ensure logic 


        /// later we can add a clause to only add team names that match a team name in the DB *****************

        if (req != null) {
            // check request quality 
            // neither should be null a game doesn't have 1 team thats not a game
            if (req.team1 != null && req.team2 != null) {
                // if this is true then construct a new game object
                
                let game = await gameDao.create(req);
                this.gameData = game; 
                
                res.status = 200;
                res.send = { success: true, game: game };
                
            } else {
                res.status= 400;
                res.send = { error: "There must be at least 2 teams in order to create a game" };
            }
        } else {
            res.status= 400 ;
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

module.exports.GameController = GameController;
