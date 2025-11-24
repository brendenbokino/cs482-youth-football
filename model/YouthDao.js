const { ObjectID } = require('mongodb');
const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const UserDao = require('./UserDao');

const youthSchema = new mongoose.Schema({
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    id_team: {
        type: mongoose.Schema.Types.ObjectId
    },
    position: {
        type: String,
    },
    dob: {
        type: Date,
    },
    id_adult: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const youthModel = mongoose.model('users_youths', youthSchema);

exports.read = async function(youthId){
    let youth = await youthModel.findById(youthId);
    return youth;
}

exports.findByUserId = async function(userId) {
    let youth = await youthModel.findOne({id_user: userId});
    return youth;
}

exports.findByAdultId = async function(adultId) {
    let youths = await youthModel.find({id_adult: adultId});
    return youths;
}

exports.del = async function(youthId){
    let youth = await youthModel.findByIdAndDelete(youthId);
    return youth;
}

exports.readAllYouth = async function(){
    let youths = await youthModel.find();
    return youths;
}

exports.create = async function(newYouth){
    const youth = new youthModel(newYouth);
    await youth.save();
    return youth;
}

exports.update = async function(id, updates){
    let youth = await youthModel.findByIdAndUpdate(id, updates, { new: true });
    return youth;
}

exports.getYouthOnTeam = async function(teamId) {
    let youth = await youthModel.find({id_team: teamId});
    return youth;
}

exports.isYouthUnderAdult = async function(youthId, adultId) {
    let youth = await youthModel.findOne({ _id: youthId, id_adult: adultId });
    return youth != null;
}

exports.deleteAll = async function(){
    await youthModel.deleteMany();
}