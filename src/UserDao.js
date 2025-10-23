const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    idCoach: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
    
});

const userModel = mongoose.model('user', userSchema);

exports.readAll = async function(){
    let users = await userModel.find();
    return users;
}

exports.read = async function(id){
    let user = await userModel.findById(id);
    return user;
}

exports.create = async function(newuser){
    const user = new userModel(newuser);
    await user.save();
    return user;
}

exports.update = function(user){
    // TODO: update email
}

exports.del = async function(id){
    let user = await userModel.findByIdAndDelete(id);
    return user;
} 

exports.deleteAll = async function(){
    await userModel.deleteMany();
}


module.exports = userModel;