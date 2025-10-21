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

class Coach {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.userInput = {};

        let name = this.name;
        let email = this.email;
        let phone = this.phone;
    }

    createAccount(){
        this.name();
        this.email();
        this.phone();

        //save to MongoDB
    }

    name(){
        this.rl.question('Enter your name: ', (name) => {
            this.userInput.name = name;
            this.rl.close();
        });
        // error check for name not already in DB (error check function)
        return this.userInput.name;
    }
    email(){
        this.rl.question('Enter your date of email: ', (email) => {
            this.userInput.email = email;
            this.rl.close();
        });
        // error check for name not already in DB (error check function)
        return this.userInput.email;
    }
    phone(){
        this.rl.question('Enter your date of phone: ', (phone) => {
            this.userInput.phone = phone;
            this.rl.close();
        });
        // error check for name not already in DB (error check function)
        return this.userInput.phone;
    }
    password(){
        this.rl.question('Enter your date of password: ', (password) => {
            this.userInput.password = password;
            this.rl.close();
        });
        // password constraint? 6+ char?
        return this.userInput.password;
    }
    idCoach(){ // need to think about how to generate ID (read in DB and ++)?
        let idCoach = randomInt(10000, 99999);
        return idCoach;
    }





    changeEmail(){
        this.rl.question('Enter your old email: ', (email) => {
            this.userInput.email = email;
            this.rl.close();
        });
    }
}



const test = new BasicTest();
test.sampleQuestions();
