
// Reeec Watkins team tests 



const TeamController = require('./TeamController.js');
const TeamDao = require('../model/TeamDao');
// Mock GameDao before requiring GameController
jest.mock('../model/TeamDao', () => ({
    create: jest.fn(),
    readAll: jest.fn(),
    read: jest.fn(),
    del: jest.fn(),
    deleteAll: jest.fn()
}));


// // team should have a list of players, coach & stats 
// players: Array,
// coach: String,
// stats: Array


describe('Team Controller Tests', () => {
   


    test ("valid team creation request ", async function () {

        const team = new TeamController();
        

        

        let req = {

            players : new Array("jim","ray","Brad"),
            coach: "BOB",
            games: new Array("metlife","theGarden")



        }

        let res = {
            status: 0,
            send: {},
        }

        

        await team.createNewTeam(req,res);
        // expect(team.team.players).toContain(req.players);
        
        expect(res.send.success).toBeTruthy();
        expect(res.send.message).toBe("Team has been created");
        
        expect(team.team.coach).toBe("BOB");


        // expect(team.team.coach).toBe("tim");
        


        // delete all after testing 
        TeamDao.deleteAll();



    });

    test("fetch all teams", async function () {

        const team = new TeamController();

        let res = {
            status: 0,
            send: {},
        }

        let req1 = {

            players : new Array("jim","ray","Brad"),
            coach: "BOB",
            games: new Array("metlife","theGarden")



        }


        let req2 = {

            players : new Array("jim","ray","Brad"),
            coach: "BOB",
            games: new Array("metlife","theGarden")



        }


        team.createNewTeam(req1,res);
        team.createNewTeam(req1,res);

        let res2 = res;

        team.getAllTeams ( res2 );



        // should be a list of our request 1 and request 2
        expect(res2.send).toBe([req1,req2]);



        TeamDao.deleteAll();



    });





});





