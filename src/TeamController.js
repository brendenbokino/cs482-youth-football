
const TeamDao = require('../model/TeamDao.js');



/// We need functions to create a game 
/// 
class TeamController {
    constructor (){
        this.team = {};
    }


    
    async createNewTeam (req, res){
        // create a payload to match our intended schema 
        // here we can also ensure logic


        // a req must have the proper schema & not be null 

       

        

            // set this team equal to the return value 
        let team = await TeamDao.create(req);


        this.team = team;

        res.status = 200;
        res.send = { success: true, message: "Team has been created" };




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