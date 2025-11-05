// Iteration #2
// Communications
// Loren Kim

const express = require("express");
const readline = require('readline');
const { connect, disconnect } = require('../model/DbConnect');
const { cliLogin } = require('../src/UserController');
const MessageDao = require('../model/MessageDao');

class Comms {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.currentUser = null;
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
        const email = await this.ask("Enter your email: ");
        const password = await this.ask("Enter your password: ");
        this.currentUser = await cliLogin(email, password);
    }

    // functions to get user input for communications
    async postMessage() {
        if (!this.currentUser) {
            console.log("Please log in to post/reply to messages.");
            await this.login();
            if (!this.currentUser) return;
        }

        const message = await this.ask("Enter your message: ");
        const newMsg = {
            message,
            author: this.currentUser.name,
            authorType: this.currentUser.permission, 
        };

        await MessageDao.create(newMsg);
        console.log(`Message posted by ${this.currentUser.name}`);
        document.getElementById("confirmationMessage").style.display = "block";
        setTimeout(() => {
            document.getElementById("confirmationMessage").style.display = "none";
        }, 3000);

        document.getElementById("messageForm").reset();
    }

    async getDate(){
        const date = new Date();
        this.userInput.date = date;
    }

    async viewMessages() {
        if (!this.currentUser) {
            console.log("Please log in to view messages.");
            await this.login();
            if (!this.currentUser) return;
        }

        const messages = await MessageDao.readAll();
        if (!messages.length) {
            console.log("No messages.");
            return;
        }

        console.log("\nMessage Board:");
        messages.forEach((msg, i) => {
            console.log(`${i + 1}. [${new Date(msg.dateCreated).toLocaleString()}] ${msg.author}: ${msg.message}`);
            if (msg.replies && msg.replies.length > 0) {
                msg.replies.forEach((r, j) => {
                    console.log(`   ↳ Reply ${j + 1} by ${r.email} [${new Date(r.date).toLocaleString()}]: ${r.message}`);
                });
            }
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
