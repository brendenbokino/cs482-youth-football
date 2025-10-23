
const gameController = require('./GameController.js');
const gameDao = require('../model/GameDao.js');
const mongoose = require('mongoose');
const { default: expect } = require('expect');


// Mock mongoose for testing
jest.mock('../model/GameDao.js');


// ===== GAME CONTROLLER TESTS =====

describe('Game Controller Tests', () => {
    

    test("createNewGame with valid data", async function() {
        // Mock successful database creation
        const mockSavedGame = {
            
            team1: 'Bears',
            team2: 'Goats',
            date: 'Oct-20-2025',
            location: 'Metlife'
        };

        
        let res = {

            status: "",
            redirect: "",

            error: "",

        };

        await gameController.createNewGame(mockSavedGame, res);

        expect(res.error).toBe("");
        expect(res.status).toBe(200);
        expect(res.redirect).toBe("index.html")

        await gameDao.deleteAll();


        
    });

    test("createNewGame with missing team1", async function() {
        const mockGame = {
            
            team1: null,
            team2: 'Goats',
            date: 'Oct-20-2025',
            location: 'Metlife'
        };

        let res = {

            status: "",
            redirect: "",

            error: "",

        };
        

        await gameController.createNewGame(mockGame, res);

        expect(res.error).toBe("There must be atleast 2 teams in order to create a game");

        await gameDao.deleteAll();
    });

    test("createNewGame with missing team2", async function() {
        const mockGame = {
            
            team1: "Bears",
            team2: null,
            date: 'Oct-20-2025',
            location: 'Metlife'
        };

        let res = {

            status: "",
            redirect: "",

            error: "",

        };

        await gameController.createNewGame(mockGame, res);

        expect(res.error).toBe("There must be atleast 2 teams in order to create a game");

        await gameDao.deleteAll();
    });


    test("createNewGame with null request", async function() {

        
        let res = {

            status: "",
            redirect: "",

            error: "",

        };

        await gameController.createNewGame(null, res);




        expect(res.error).toBe("req is empty");
    });

    // test("getAllGames", async function() {
    //     const mockGames = [
    //         {  team1: 'Bears', team2: 'Goats', date: 'Oct-20-2025', location: 'Metlife' },
    //         { team1: 'Eagles', team2: 'Hawks', date: 'Oct-21-2025', location: 'Central Field' }
    //     ];

    //     const res1 = { };
    //     const res2 = { };



    //     await gameController.createNewGame(mockGames[0], res1);
    //     await gameController.createNewGame(mockGames[0], res2);

        
        
    //     const res = {};
    //     res.status = 0;
    //     res.send = [];
    //     res.end = "";

    //     await gameController.getAllGames(res);

        
    //     expect(res.status).toBe(200);
    //     expect(res.send).toEqual(mockGames);
    //     // expect(res.end).toBe();

    //     // delete all work 
    //     await gameDao.deleteAll();
    // });

    test("deleteAllGames", async function() {
        // Mock gameDao.deleteAll

        const mockGames = [
            { team1: 'Bears', team2: 'Goats', date: 'Oct-20-2025', location: 'Metlife' },
            { team1: 'Eagles', team2: 'Hawks', date: 'Oct-21-2025', location: 'Central Field' }
        ];

        
        let res1 = {

            status: "",
            redirect: "",

            error: "",

        };
        
        let res2 = {

            status: "",
            redirect: "",

            error: "",

        };



        await gameController.createNewGame(mockGames[0], res1);
        await gameController.createNewGame(mockGames[0], res2);

        let res = {


            send : [],
            status: 0
        };

        // doesn't take any params
        await gameController.deleteAllGames( );


        // should expect the returned list form a read to be null/ empty
        await gameController.getAllGames(res);

        expect(res.send).toBe(null);

        await gameDao.deleteAll();
        
    });
});




