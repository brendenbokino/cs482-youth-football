const Coach = require('./Coach');
const mongoose = require('mongoose');
const UserDao = require('./UserDao');

async function main() {
    await mongoose.connect('mongodb+srv://db_admin:K9v5ypo51rXX81Lv@lorb-loyola-se.lh1asxt.mongodb.net/?retryWrites=true&w=majority&appName=lorb-loyola-se', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  
    const coach = new Coach();
    await coach.createAccount(); 
  
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
  
  main().catch(console.error);