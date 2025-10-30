// Iteration #2
// Communications
// Loren Kim

const readline = require('readline');

class Comms {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.userInput = {};
        this.messages = []; // In-memory storage for messages
    }

    // async prompt for user input
    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    // functions to get user input for communications
    async postMessage(){
        const message = await this.ask("Enter your message: ");
        const author = await this.ask("Enter your name: ");
        const date = new Date();
        const newMessage = { message, author, date };
        this.messages.push(newMessage); // Save message in memory
        this.userInput = newMessage;
    }

    async getDate(){
        const date = new Date();
        this.userInput.date = date;
    }

    async getAuthor(){
        const author = await this.ask("Enter your name: ");
        this.userInput.author = author;
    }

    async viewMessages(){
        return this.messages; // Return all messages
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
