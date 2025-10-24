// Interation #1
// Due Oct 23, 2025, 11:00 PM

// Loren Kim - 1/2 Coach account




// we need:
    // coach info (done)
    // save coach account to MongoDB (done)
    // update coach info (email, phone number)
    // delete coach account
    // view coach account info


const readline = require('readline');
const UserDao = require('../model/UserDao');

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
        if (phone.length < 10 || isNaN(phone)) {
            console.log("Phone number must be at least 10 digits and only numbers.");
            return this.phone();
        }
        this.userInput.phone = phone;
    }

    async password(){
        const password = await this.ask("Enter your password (4+ characters): ");
        if (password.length < 4) {
            console.log("Password must be at least 4 characters long.");
            return this.password();
        }
        this.userInput.password = password;
    }
    

    async createAccount() {
        await this.name();
        await this.email();
        await this.phone();
        await this.password();
    
        await UserDao.create(this.userInput);
    
        console.log("Account created:", this.userInput);
        console.log("-------------------------");
    }

    async viewAccountInfo(){
        const email = await this.ask("Enter your email to view account info: ");
        const users = await UserDao.readAll();
        const user = users.find(u => u.email === email);
        if (user) {
            console.log("Account Info:", user);
        } else {
            console.log("No account found with that email.");
        }
    }

    async deleteAccount(){
        const email = await this.ask("Enter your email to delete account: ");
        const users = await UserDao.readAll();
        const user = users.find(u => u.email === email);
        if (user) {
            await UserDao.del(user._id);
            console.log("Account deleted successfully.");
        } else {
            console.log("No account found with that email.");
        }
    }

    // update user account info
    async updateAccount(){
        const email = await this.ask("Enter your email to update account: ");
        const users = await UserDao.readAll();
        const user = users.find(u => u.email === email);
        if (!user) {
            console.log("No account found with that email.");
            return;
        }
        console.log("To update your account, please enter a corresponding number:");
        console.log("1. Update Name");
        console.log("2. Update Email");
        console.log("3. Update Phone Number");
        console.log("4. Update Password");

        const choice = await this.ask("Enter the number of the field you want to update: ");
        let updates = {};
        switch(choice){
            case '1':
                updates.name = await this.ask("Enter new name: ");
                break;
            case '2':
                updates.email = await this.ask("Enter new email: ");
                break;
            case '3':
                updates.phone = await this.ask("Enter new phone: ");
                break;
            case '4':
                updates.password = await this.ask("Enter new password: ");
                break;
            default:
                console.log("Invalid choice");
                break; 
        }

        const updatedUser = await UserDao.update(user._id, updates);
        console.log("Account updated to:", updatedUser);
    }

    async menu(){
        console.log("Coach Menu:");
        console.log("1. Create Account");
        console.log("2. Update Email");
        console.log("3. Delete Account");
        console.log("4. View Account Info");
        console.log("5. Exit");
    }

    async choice(userChoice) {
        switch (userChoice) {
            case '1': await this.createAccount(); break;
            case '2': await this.updateAccount(); break;
            case '3': await this.deleteAccount(); break;
            case '4': await this.viewAccountInfo(); break;
            case '5': console.log("Goodbye!"); this.rl.close(); return true;
            default: console.log("Invalid choice");
        }
        return false;
    }

    async run() {
        let exit = false;
        while (!exit) {
            await this.menu();
            const userChoice = await this.ask("Enter your choice: ");
            exit = await this.choice(userChoice);
        }
        this.rl.close();
    }
    
}

module.exports = Coach;
