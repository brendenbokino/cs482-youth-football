// this will define the logic for our Game model 
const gameDao = require('../model/GameDao.js');



/// We need functions to create a game 
exports.createNewGame = async function(req, res){
    // create a payload to match our intended schema 
    // here we can also ensure logic 

    if ( req != null ){

        // let newgame = {};

        // check request quality 
        // neither should be null a game doesn't have 1 team thats not a game
        if ( req.team1 != null && req.team2 != null ){
            // if this is true then construct a new game object
            

            


            let game = await gameDao.create(req);
            if( game != null){
                
                
                res.redirect = "index.html";
                res.status = 200;
            } else{
                res.status = 400;
            }


        } else {
            res.error = "There must be atleast 2 teams in order to create a game";
        }
    } else {
        res.error = "req is empty";
    }


}

//fetch all games function. 
//no params needed just return what's in the Game data base
exports.getAllGames = async function (res) {
    let allGames = await gameDao.readAll();

    
    res.status = 200;
    res.send = allGames;
    
    
}

// delete all function -- greate for a testing environment 
exports.deleteAllGames = async function () {
    await gameDao.deleteAll();

   // there is no return here so we'll have to read the dao in the test to ensure it has really been deleted 
    
}