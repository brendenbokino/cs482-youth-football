// Iteration #2
// Communications
// Loren Kim

const readline = require('readline');
const { connect, disconnect } = require('../model/DbConnect');
const UserDao = require('../model/UserDao');

class Comms {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.userInput = {};
        this.messages = []; // storage for messages
        this.currentUser = null; // store user
    }

    // async prompt for user input
    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    async login() {
        try {
            connect();
            const email = await this.ask("Enter your email: ");
            const password = await this.ask("Enter your password: ");

            const account = await UserDao.findLogin(email);

            if (!account) {
                console.log("No account found with that email.");
                await disconnect();
                return;
            }

            if (account.password !== password) {
                console.log("Incorrect password.");
                await disconnect();
                return;
            }

            this.currentUser = account;
            console.log(`Logged in as ${account.name}`);
        } catch (err) {
            console.error("Login error:", err);
        }
    }


    

    // functions to get user input for communications
    async postMessage(){
        if (!this.currentUser) {
            console.log("Please log in to post/reply to messages.");
            await this.login();
            if (!this.currentUser) return;
        }

        const message = await this.ask("Enter your message: ");
        const author = this.currentUser.name;
        const date = new Date();

        const newMessage = { message, author, date };
        this.messages.push(newMessage);
        this.userInput = newMessage;

        console.log(`Message posted by ${author} on ${date.toLocaleString()}`);
    }

    async getDate(){
        const date = new Date();
        this.userInput.date = date;
    }

    async viewMessages() {
        if (this.messages.length === 0) {
            console.log("No messages.");
            return;
        }

        console.log("Message Board:");
        this.messages.forEach((msg, i) => {
            console.log(`${i + 1}. [${msg.date.toLocaleString()}] ${msg.author}: ${msg.message}`);
        });
    }

    async deleteMessages(){
        // delete messages from the database
    }

    async replyMessage(){
        // reply to a message
    }

    async updateMessage(){
        // update a message
        this.getDate();
    }

    
    // general message board to post questions and announcements and respond to it
    // array as a type with the answer in MongoDB 1:N relationship
    // post question, type person who created question, flag for edited, date created, date edited
    // test cases: 1 user in database use their id, fetch user when it's ready, update fetch function when login is ready
}

module.exports = Comms;
