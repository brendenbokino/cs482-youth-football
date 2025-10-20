// Interation #1
// Due Oct 23, 2025, 11:00 PM

// Loren Kim - 1/2 Coach account

const readline = require('readline');

class BasicTest {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.userInput = {};
    }

    sampleQuestions() {
        console.log("Sample input/output");

        this.rl.question('Enter your name: ', (name) => {
            this.userInput.name = name;

            this.rl.question('Enter your age: ', (age) => {
                this.userInput.age = age;

                console.log("\nTesting input:", name, age);
                this.rl.close();
            });
        });
    }
}

const test = new BasicTest();
test.sampleQuestions();