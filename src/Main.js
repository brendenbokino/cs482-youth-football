const Coach = require('./src/Coach');
const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
    const DB_URI = process.env.DB_URI;
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');
  
    const coach = new Coach();
    await coach.createAccount(); 
  
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
}

  
main();
