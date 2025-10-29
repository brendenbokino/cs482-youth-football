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
    async getRecipient(){
        // display all users in the database
    }

    async composeMessage(){
        const message = await this.ask("Enter your message: ");
        this.userInput.message = message;
    }

    async viewMessages(){
        // retrieve messages from the database and display them
    }

    async deleteMessages(){
        // delete messages from the database
    }

    async getGroup(){
        // send to a whole groups in the database (ie. parents on your team)
    }
}
    