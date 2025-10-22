// Interation #1
// Due Oct 23, 2025, 11:00 PM

// Loren Kim - 1/2 Coach account




// we need:
    // coach info
    // save coach account to MongoDB
    // update coach info (email, phone number)
    // delete coach account
    // view coach account info

const { randomInt } = require('crypto');
const readline = require('readline');
const mongoose = require('mongoose');

class Coach {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.userInput = {};
    }

    async name(){
        const name = await this.ask("Enter your name: ");
        this.userInput.name = name;
    }
    async email(){
        const email = await this.ask("Enter your email: ");
        this.userInput.email = email;
    }
    async phone(){
        const phone = await this.ask("Enter your phone: ");
        this.userInput.phone = phone;
    }
    async password(){
        const password = await this.ask("Enter your password: ");
        this.userInput.password = password;
        // error check that password is 6+ char?
    }
    async idCoach(){ // need to think about how to generate ID (read in DB and ++)?
        let idCoach = randomInt(10000, 99999);
        return idCoach;
    }

    async createAccount() {
        await this.name();
        await this.email();
        await this.phone();
        await this.password();
        await this.idCoach()
    
        await UserDao.create(this.userInput);
    
        console.log("Account created:", this.userInput);
        console.log("Confirming account info:", this.userInput);
        this.rl.close();
    }






    async changeEmail(){
        this.rl.question('Enter your old email: ', (email) => {
            this.userInput.email = email;
            this.rl.close();
        });
    }
}



const test = new BasicTest();
test.sampleQuestions();
