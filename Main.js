const Coach = require('./src/Coach');
const mongoose = require('mongoose');
require('dotenv').config();

// if running for first time, npm install mongoose dotenv -> Node Main

async function main() {
    const DB_URI = process.env.DB_URI;
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');
    const coach = new Coach();

    await coach.menu();
    await coach.choices();
    //const coach = new Coach();
    //await coach.createAccount(); 
  
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
}

  
main();
