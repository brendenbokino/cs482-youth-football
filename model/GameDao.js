const mongoose = require('mongoose');

// a game should have 2 teams, a date for when it will occur, a location for where it will occur & then some meta data 
const gameSchema = new mongoose.Schema({
    team1: String,
    team2: String,
    date: String,
    location: String,
});

const gameModel = mongoose.model('game', gameSchema);

exports.readAll = async function(){
    let games = await gameModel.find();
    return games;
}

exports.read = async function(id){
    let game = await gameModel.findById(id);
    return game;
}

exports.create = async function(newgame){
    let game = new gameModel(newgame); 
    await game.save();
    return game;
}

exports.update = function(game){}

exports.del = async function(id){
    let game = await gameModel.findByIdAndDelete(id);
    return game;
} 

exports.deleteAll = async function(){
    await gameModel.deleteMany();
}

