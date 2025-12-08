const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true
    },
    id_coach: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    record: {
        type: Array,
        default: [0,0]
    }
});

const teamModel = mongoose.model('teams', teamSchema);

exports.readAll = async function(){
    let teams = await teamModel.find();
    return teams;
}


exports.create = async function(newteam){
    const team = new teamModel(newteam);
    await team.save();
    return team;
}

exports.read = async function(id){
    let team = await teamModel.findById(id);
    return team;
}

exports.update = async function(id, updateData){
    let team = await teamModel.findByIdAndUpdate(id, updateData, { new: true });
    return team;
}

exports.findByCoachId = async function(coachId){
    let team = await teamModel.findOne({ id_coach: coachId });
    return team;
}

exports.del = async function(id){
    let team = await teamModel.findByIdAndDelete(id);
    return team;
} 

exports.deleteAll = async function(){
    await teamModel.deleteMany();
}

