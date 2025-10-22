const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({

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
    const game = new gameModel(newgame);
    await game.save();
    return game;
}

exports.update = function(game){

}

exports.del = async function(id){
    let game = await gameModel.findByIdAndDelete(id);
    return game;
} 

exports.deleteAll = async function(){
    await gameModel.deleteMany();
}

