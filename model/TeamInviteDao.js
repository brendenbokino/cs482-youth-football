const { createDidYouMeanMessage } = require('jest-validate');
const { Int32 } = require('mongodb');
const mongoose = require('mongoose');

const teamInviteSchema = new mongoose.Schema({
    id_youth: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    id_team: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const teamInviteModel = mongoose.model('team_invites', teamInviteSchema);

exports.readAll = async function(){
    let invites = await teamInviteModel.find();
    return invites;
}

exports.create = async function(newInvite){
    const invite = new teamInviteModel(newInvite);
    await invite.save();
    return invite;
}

exports.read = async function(id){
    let invite = await teamInviteModel.findById(id);
    return invite;
}

exports.getInvitesByYouthId = async function(youthId){
    let invites = await teamInviteModel.find({ id_youth: youthId });
    return invites;
}

exports.getInvitesByTeamId = async function(teamId){
    let invites = await teamInviteModel.find({ id_team: teamId });
    return invites;
}

exports.del = async function(id){
    let invite = await teamInviteModel.findByIdAndDelete(id);
    return invite;
}

exports.deleteAll = async function(){
    await teamInviteModel.deleteMany();
}
