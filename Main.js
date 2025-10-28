const UserController = require('./UserController.js');
const User = UserController.User;
const mongoose = require('mongoose');
require('dotenv').config();

// if running for first time, add IP to MongoDB, npm install mongoose dotenv mongodb -> Node Main

async function main() {
    try {
        const DB_URI = process.env.DB_URI;
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB');
    
        const user = new User();

        
        //await user.menu(); 
        //await user.choice();

        await user.run();


    } catch (error) {
        console.error('Error connecting to MongoDB:', error);

    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

  
main();
