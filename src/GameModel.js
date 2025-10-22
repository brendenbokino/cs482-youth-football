


class Game {

    // a game should have 2 teams
    // a game should have a date & place where it takes place
    // a game should hold stats 


    constructor(team1,team2,date,location){

        this.team1 = team1;
        this.team2 = team2;

        this.date  = date;
        this.location = location;

    }

    // constructor(){
    //     // default cpnstructor 

    //     this.team1 = "";
    //     this.team2 = "";

    //     this.date  = "";
    //     this.location = "";

    // }


    createGame ( teams, date, location ){
        // takes in a list of teams, a singular date & a location

        // dates can change, so can location so we'll add more functions for these 



        if ( teams.length  ==  2 ) {

            this.team1 = teams[0];
            this.team2 = teams[1];

            this.date = date;
            this.location = location;

            return 0;

        } else { 
            return -1; 
        }


    }

    changeDate(date){
        this.date = date;
    }

    changeLocation(location){
        this.location = location;
    }
}

// const gameSchema = new mongoose.Schema ({
//     Team1: String,
//     Team2: String,
//     Date: String,
//     Location: String,
//     status: {type: Number, default:0 },
//     creation: { type:Date, default:Date.now } 
// })

// const gameModel = mongoose.model('game',gameSchema);


// //// after mongo DB intergration code: example 



// // //CRUD
// // guessing this has to match the schema 
// exports.createGame = async function(gamedata){
//     let game = new gameModel(gamedata); 
//     await game.save();
//     return game;
// }



// ///
// exports.readAllgames = async function(){
//     let lstGames = await gameModel.find();
//     // Later try: find().sort({name:'asc'}).skip(0).limit(5);
//     return lstGames;
// }



// /// when creating new DB elements in mongo do this always get an id? and where do we track this in app? temporary array?
// exports.readOne = async function(id){
//     let game = await gametModel.findById(id);
//     return game;
// }

// exports.update = function(){

//     // when should we update so we'd pass the orginal data with any modifications & update by id?
// }
// exports.deleteOne = function(){
//     //. find by id and then delete 
// }

// //Should **ONLY** be used for testing
// exports.deleteAll = async function(){
//     await contactModel.deleteMany();
// }

// mongo key = K9v5ypo51rXX81Lv
// Export the class for use in other modules
module.exports = Game;