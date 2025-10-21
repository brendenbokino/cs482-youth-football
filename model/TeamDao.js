const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({

});

const teamModel = mongoose.model('team', teamSchema);

exports.readAll = async function(){
    let teams = await teamModel.find();
    return teams;
}

exports.read = async function(id){
    let team = await teamModel.findById(id);
    return team;
}

exports.create = async function(newteam){
    const team = new teamModel(newteam);
    await team.save();
    return team;
}

exports.update = function(team){

}

exports.del = async function(id){
    let team = await teamModel.findByIdAndDelete(id);
    return team;
} 

exports.deleteAll = async function(){
    await teamModel.deleteMany();
}

