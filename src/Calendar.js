
const Game = require('./Game.js');

class Calendar {
    constructor(){
        this.teams = [];
        this.games = new Map();
    }


    addGame(game) { 
        // must be of type Game class
        if (!(game instanceof Game)) {
            throw new Error('Parameter must be an instance of Game class');
        }
        
        // Add game to calendar using its date
        if (!this.games.has(game.date)) {
            this.games.set(game.date, []);
        }
        this.games.get(game.date).push(game);
    }

    

    getGamesByDate(date) {
        return this.games.get(date) || [];
    }
}