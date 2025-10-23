const Coach = require('./src/Coach');
const mongoose = require('mongoose');
require('dotenv').config();

// if running for first time, add IP to MongoDB, npm install mongoose dotenv mongodb -> Node Main

async function main() {
    try {
        const DB_URI = process.env.DB_URI;
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB');
    
        const coach = new Coach();
        await coach.choice();
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

  
main();
