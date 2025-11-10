const { Int32 } = require('mongodb');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    permission: {
        type: Int32,
        required: true
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        required: true
    }
});

const userModel = mongoose.model('users', userSchema);

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

exports.update = async function(id, updates){
    let user = await userModel.findByIdAndUpdate(id, updates, { new: true });
    return user;
}

exports.del = async function(id){
    let user = await userModel.findByIdAndDelete(id);
    return user;
} 

exports.deleteAll = async function(){
    await userModel.deleteMany();
}

exports.findLogin = async function(userOrEmail){
    let user = null;
    if (userOrEmail.includes('@')){
        user = await userModel.findOne({email: userOrEmail})
    } else {
        user = await userModel.findOne({username: userOrEmail})
    }
    return user;
}

