const TeamController = require('./TeamController.js');
const TeamDao = require('../model/TeamDao');





async function test() {

    teams = new TeamController();


    let req = {

        players : new Array("jim","ray","Brad"),
        coach: "BOB",
        games: new Array("metlife","theGarden")



    }

    TeamDao.create.mockResolvedValue(req);

    await teams.createNewTeam(req);

    const teamss = await TeamDao.readAll();

    

    console.log(teamss);
    console.log("he;");
    
}

// 


test();
