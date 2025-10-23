// this will define the logic for our Game model 
const TeamDao = require('../model/GameDao.js');



/// We need functions to create a game 
/// 
class TeamController {
    constructor (){
        this.team = {};
    }


    
    async createNewTeam (req){
        // create a payload to match our intended schema 
        // here we can also ensure logic
        team = TeamDao.create(req);

    }

    //fetch all games function. 
    //no params needed just return what's in the Game data base
    async getAllTeams (res) {
        let allTeams = await TeamDao.readAll();

        res.status = 200;
        res.send = allTeams;
        
    }
}

module.exports = TeamController;