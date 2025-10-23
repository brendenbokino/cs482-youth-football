// src/Coach.test.js
// Loren Kim - 1/2 Coach account tests

const Coach = require('./Coach.js');
const UserDao = require('./UserDao'); 
jest.mock('./UserDao');


describe("Coach Account Tests", function() {
    beforeEach(() => {
        jest.clearAllMocks(); // read to clear mocks before each test
    });
    //afterAll(async () => {
     //   await mongoose.disconnect(); // kept getting errors about open handles, so added this
      //});

    test("create a new coach account", async()  =>{
        const coach = new Coach();
        UserDao.create.mockResolvedValue(true);

        coach.userInput = {
            name: "Loren Kim",           
            email: "loren@example.com",
            phone: "1234567890",
            password: "password123",
            idCoach: 12345
        };

        coach.name = jest.fn();
        coach.email = jest.fn();
        coach.phone = jest.fn();
        coach.password = jest.fn();
        coach.idCoach = jest.fn().mockResolvedValue(12345);

        await coach.createAccount();
    
        expect(UserDao.create).toHaveBeenCalledWith(coach.userInput);
        expect(coach.userInput.name).toBe("Loren Kim");
        expect(coach.userInput.email).toBe("loren@example.com");
        expect(coach.userInput.phone).toBe("1234567890");
        expect(coach.userInput.password).toBe("password123");
        expect(coach.userInput.idCoach).toBe(12345);
    
    });

});

describe("Coach Menu and Choice Tests", function () {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("menu() should display the menu options", async () => {
        const coach = new Coach();
        coach.ask = jest.fn().mockResolvedValue("5");  // looked up how to mock user input
        jest.spyOn(console, 'log').mockImplementation(() => {}); // same here

        const choice = await coach.menu();
        expect(choice).toBe("5");

        expect(console.log).toHaveBeenCalledWith("Coach Menu:");
        expect(console.log).toHaveBeenCalledWith("1. Create Account");
        expect(console.log).toHaveBeenCalledWith("2. Update Email");
        expect(console.log).toHaveBeenCalledWith("3. Delete Account");
        expect(console.log).toHaveBeenCalledWith("4. View Account Info");
        expect(console.log).toHaveBeenCalledWith("5. Exit");
    });

    test("choice() should call createAccount() when input is '1'", async () => {
        const coach = new Coach();
        coach.ask = jest.fn().mockResolvedValue("1");  

        coach.createAccount = jest.fn();
        jest.spyOn(console, 'log').mockImplementation(() => {});

        await coach.choice();
        expect(coach.createAccount).toHaveBeenCalled();
        expect(console.log).not.toHaveBeenCalledWith("Invalid choice");
    });
});
