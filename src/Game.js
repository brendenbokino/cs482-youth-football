


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

// Export the class for use in other modules
module.exports = Game;