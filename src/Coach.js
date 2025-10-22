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

    // async prompt for user input
    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    
    // functions to get user input for coach account creation
    async name(){
        const name = await this.ask("Enter your name: ");
        this.userInput.name = name;
    }

    async email(){
        const email = await this.ask("Enter your email: ");
        this.userInput.email = email;
    }

    async phone(){
        const phone = await this.ask("Enter your phone (only numbers): ");
        this.userInput.phone = phone;
        if (phone.length < 10 || isNaN(phone)) {
            console.log("Phone number must be at least 10 digits and only numbers.");
            await this.phone();
        }
    }

    async password(){
        const password = await this.ask("Enter your password (4+ characters): ");
        this.userInput.password = password;
        if (password.length < 4) {
            console.log("Password must be at least 4 characters long.");
            await this.password();
        }
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

    // update user account info
    async changeEmail(){
        const oldEmail = await this.ask("Enter your old email: ");
        const newEmail = await this.ask("Enter your new email: ");

        const updated = await UserDao.updateEmail(oldEmail, newEmail);
        if (updated) {
            console.log("Email updated successfully.");
        } else {
            console.log("No account found with that email.");
        }
    }

    async menu(){
        console.log("Coach Menu:");
        console.log("1. Create Account");
        console.log("2. Update Email");
        console.log("3. Delete Account");
        console.log("4. View Account Info");
        console.log("5. Exit");

        const choice = this.ask("Enter your choice: ");
        return choice;
    }

    async choice(){
        const choice = await this.menu();
        switch(choice){
            case '1':
                this.createAccount();
                break;
            case '2':
                this.changeEmail();
                break;
            case '3':
                this.deleteAccount();
                break;
            case '4':
                this.viewAccountInfo();
                break;
            case '5':
                this.rl.close();
                break;
            default:
                console.log("Invalid choice");
                this.menu();
                break; 
        }
    }
}
