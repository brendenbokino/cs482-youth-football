const TeamController = require('./TeamController.js');
const TeamDao = require('../model/TeamDao');



team = new TeamController();


let req = {

    players : new Array("jim","ray","Brad"),
    coach: "BOB",
    games: new Array("metlife","theGarden")



}

async function test() {
    await team.createNewTeam(req);

    print(team.team);
    print("he;")
    
}

// 


test();
