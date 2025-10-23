// this will define the logic for our Game model 
const gameDao = require('../model/GameDao.js');




class GameController {
    constructor() { 
        this.gameData = {};
    }

    /// We need functions to create a game 
    async createNewGame(req, res) {
        // create a payload to match our intended schema 
        // here we can also ensure logic 

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

}


module.exports = GameController;
