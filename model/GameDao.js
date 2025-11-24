const mongoose = require('mongoose');

// a game should have 2 teams, a date for when it will occur, a location for where it will occur & then some meta data 
const gameSchema = new mongoose.Schema({
    id_team1: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
    },
    id_team2: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
    },
    date: Date, /// date type to make sorting easier 
    location: String,
    link: String,
    startTime: Date,
    endTime: Date,
    
    // team1Score: {
    //     type: Number,
    //     default: 0
    // },
    // team2Score: {
    //     type: Number,
    //     default: 0
    // },
    // playerStats: {
    //     type: Array,
    //     default: [] // Array of { playerId, statType, value, timestamp }
    // },
    // _id: String

    
});

const gameModel = mongoose.model('game', gameSchema);

exports.readAll = async function(){
    let games = await gameModel.find();
    return games;
}

exports.read = async function(id){
    console.log('GameDao.read: Looking up game with ID:', id);
    console.log('GameDao.read: ID type:', typeof id);
    
    try {
        let game = await gameModel.findById(id);
        
        if (game) {
            console.log('GameDao.read: Game found successfully');
            console.log('GameDao.read: Game _id:', game._id);
            console.log('GameDao.read: Game teams:', game.team1, 'vs', game.team2);
        } else {
            console.log('GameDao.read: No game found with ID:', id);
        }
        
        return game;
    } catch (error) {
        console.error('GameDao.read: Error looking up game:', error);
        console.error('GameDao.read: Error message:', error.message);
        throw error;
    }
}

exports.create = async function(newgame){
    try {
        const result = await gameModel.create(newgame); // Use create() to let MongoDB handle _id
        return result;
    } catch (error) {
        console.error('GameDao.create: Error creating game:', error.message);
        throw error;
    }
}

exports.update = async function(id, updateData){
    let game = await gameModel.findByIdAndUpdate(id, updateData, { new: true });
    return game;
}

exports.del = async function(id){
    let game = await gameModel.findByIdAndDelete(id);
    return game;
} 

exports.deleteAll = async function(){
    await gameModel.deleteMany();
}

