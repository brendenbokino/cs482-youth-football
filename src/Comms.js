// Iteration #2
// Communications
// Loren Kim

const readline = require('readline');
const { connect, disconnect } = require('../model/DbConnect');
const UserDao = require('../model/UserDao');

class Comms {
    constructor() {
        this.session = session; // use session to track logged-in users
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

    // login function to get current user
    async getCurrentUser() {
        try {
            const response = await axios.get('http://localhost:3000/loggedUser', { withCredentials: true });
            this.currentUser = response.data;
            if (!this.currentUser) console.log("No user logged in.");
        } catch (err) {
            console.error("Error fetching logged user:", err);
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
        if (this.messages.length === 0) {
            console.log("No messages to delete.");
            return;
        }

        await this.viewMessages();

        if (!this.currentUser || this.currentUser.name !== msg.author) {
            console.log("You can only delete your own messages.");
            return;
        }

        console.log("Message deleted successfully.");
        // delete messages from the database
    }

    async replyMessage(){
        if (this.messages.length === 0) {
            console.log("No messages to reply to.");
            return;
        }

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
