const mongoose = require('mongoose');

const numberDefault = {
    type: Number,
    default: 0
}


// ygr = youth game record
const ygrSchema = new mongoose.Schema({
    id_game: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    id_youth: {
        type: mongoose.Schema.Types.ObjectId,
        required: true 
    },
    
    // Rushing stats
    rushing_attempts: numberDefault,
    rushing_yards: numberDefault,
    rushing_tds: numberDefault,

    // Passing stats
    passing_attempts: numberDefault,
    passing_completions: numberDefault,
    passing_yards: numberDefault,
    passing_tds: numberDefault,

    // Receiving stats
    receptions: numberDefault,
    receiving_yards: numberDefault,
    receiving_tds: numberDefault,

    // Defensive stats
    tackles: numberDefault,
    sacks: numberDefault,
    interceptions: numberDefault,
    fumbles_forced: numberDefault,
    fumbles_recovered: numberDefault,
});

const ygrModel = mongoose.model('game_records', ygrSchema);

exports.readAll = async function(){
    let records = await ygrModel.find();
    return records;
}
exports.create = async function(newrecord){
    const record = new ygrModel(newrecord);
    await record.save();
    return record;
}
exports.read = async function(id){
    let record = await ygrModel.findById(id);
    return record;
}

exports.getGameRecords = async function(gameId){
    let records = await ygrModel.find({ id_game: gameId });
    return records;
}  

exports.getYouthRecords = async function(youthId){
    let records = await ygrModel.find({ id_youth: youthId });
    return records;
}

exports.getYouthRecordsInGame = async function(youthId, gameId) {
    let records = await ygrModel.find({ id_youth: youthId, id_game: gameId});
    return records;
}

exports.update = async function(id, updateData){
    let record = await ygrModel.findByIdAndUpdate(id, updateData, { new: true });
    return record;
}   

exports.del = async function(id){
    let record = await ygrModel.findByIdAndDelete(id);
    return record;
}

exports.deleteAll = async function(){
    await ygrModel.deleteMany();
}
