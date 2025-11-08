// Interation #1
// Due Oct 23, 2025, 11:00 PM

// Loren Kim - 1/2 Coach account

/*
Permission Levels:
0 - Admin
1 - Coach
2 - Adult
3 - Youth
4 - Guest?
*/



const readline = require('readline');
const UserDao = require('../model/UserDao');
const hash = require('../util/Hashing');

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

    async username(){
        const username = await this.ask("Enter your username: ");
        this.userInput.username = username;
    }

    async email(){
        const email = await this.ask("Enter your email: ");
        this.userInput.email = email;
    }

    async permission(){
        const account_type = Number(await this.ask("Enter your account type. The types are Admin (0), Coach (1), Adult (2), Youth (3) and Guest (4)."));
        if (account_type.isNaN || account_type < 0 || account_type > 4) {
            console.log("Please enter a valid option, a number 1-4.");
            return this.permission();
        }
        this.userInput.permission = account_type;
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
        hashedpwd = hash.hashString(password)
        this.userInput.password = hashedpwd;
    }
    

    async createAccount() {
        await this.permission();
        await this.email();
        await this.username();
        await this.password();
        await this.name();
        await this.phone();
        
    
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

    // update user account info & need to refactor in next iteration
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
        console.log("5. Update Username");
        console.log("6. Update Permission Level");

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
                updates.password = hash.hashString(updates.password);
                break;
            case '5':
                updates.username = await this.ask("Enter a new username: ");
                break;
            case '6':
                updates.permission = await this.ask("Enter new permission level (0 Admin, 1 Coach, 2 Adult, 3 Youth, 4 Guest): ")
            default:
                console.log("Invalid choice");
                break; 
        }

        const updatedUser = await UserDao.update(user._id, updates);
        console.log("Account updated to:", updatedUser);
    }

    async menu(){
        console.log("User CRUD Menu:");
        console.log("1. Create Account");
        console.log("2. Update Account");
        console.log("3. Delete Account");
        console.log("4. View Account Info");
        console.log("5. Exit");
    }

    async choice(userChoice) {
        switch (userChoice) {
            case '1': 
                await this.createAccount(); 
                break;
            case '2': 
                await this.updateAccount(); 
                break;
            case '3': 
                await this.deleteAccount(); 
                break;
            case '4': 
                await this.viewAccountInfo(); 
                break;
            case '5': 
                console.log("Goodbye!"); 
                this.rl.close(); 
                return true;
            default: 
                console.log("Invalid choice");
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

exports.User = User;

exports.login = async function(req, res){
    let plogin = req.body.login_id;
    let user = await UserDao.findLogin(plogin); 

    if (user == null){ //login not found
        res.redirect('/login.html?error=1'); //redirect back to login, NtE error message
    } else {
        if (hash.compareHash(req.body.login_pass, user.password)){
            //passwords match
            console.log('successful login');

            req.session.user = user;
            res.redirect('/profile.html') 

        } else{ //passwords do not match
            res.redirect('/login.html?error=2') //redirect back to login, NtE error message

        }
    } 
}

exports.loggedUser = function(req, res){
    res.status(200) //200 = ok
    if(req.session.user) //if there is a user logged in
        res.send(req.session.user) //send the logged user
    else
        res.json(null);
    res.end();
}

exports.logout = async function(req, res){
    req.session.user = null;
    res.redirect('/');
}

exports.register = async function(req, res) {
    let existingUsername = await UserDao.findLogin(req.body.username);
    let existingEmail = await UserDao.findLogin(req.body.email);
    if (existingUsername == null && existingEmail == null) {
        if (req.body.pass != req.body.confirm_pass) {
            console.log('Confirm password failed on registration.');
            res.redirect('/register.html');
            return;
        }

        // Todo: validty checks on other input (email, username, etc.)

        let userInfo = {
            email: req.body.email,
            username: req.body.username,
            name: req.body.name,
            permission: 4, // Default to guest
            phone: req.body.phone,
            password: hash.hashString(req.body.pass)
        };

        UserDao.create(userInfo);
        console.log('Successfully registered user.');
        res.redirect('/profile.html');
    } else {
        if (existingUsername) {
            console.log('User already exists with username.');
        } else {
            console.log('User already exists with email.');
        }
        
        res.redirect('/register.html');
    }
}