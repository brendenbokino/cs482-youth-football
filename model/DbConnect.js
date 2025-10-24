require('dotenv').config();
const mongoose = require('mongoose');

exports.connect = function(where){
    let uri = process.env.DB_URI; //production DB
    if(where==='test') uri = process.env.TESTDB_URI; //Test DB
    if(where==='files') uri = process.env.FILESDB_URI; //Files DB

    mongoose.connect(uri);
}

exports.disconnect = async function(){
    await mongoose.connection.close();
}