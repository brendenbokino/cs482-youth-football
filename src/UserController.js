const dao = require('../model/UserDao')
const readline = require('readline')

class User {
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
        await this.phone();
        await this.password();
        await dao.create(this.userInput);
    
        console.log("Account created:", this.userInput);
        console.log("-------------------------");
    }
}

exports.login = async function(req, res){
    let plogin = req.body.login_id;
    let user = await dao.findLogin(plogin); 

    if (user == null){ //login not found
        res.redirect('/login.html'); //redirect back to login, NtE error message
    } else {
        if (req.body.login_pass.localeCompare(user.password)==0){
            //passwords match
            console.log('successful login');

            req.session.user = user;
            res.redirect('/') //redirect to home page, could change 
        } else{ //passwords do not match
            res.redirect('/login.html') //redirect back to login, NtE error message

        }
    } 
}
