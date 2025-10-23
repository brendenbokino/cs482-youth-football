// src/Coach.test.js
// Loren Kim - 1/2 Coach account tests

// replaced mongoose with a mock for jest testing
jest.mock('mongoose', () => ({
    connect: jest.fn().mockResolvedValue(),
    model: jest.fn().mockReturnValue({
      find: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    }),
    Schema: jest.fn(),
}));

// I was having errors with stdin so I mocked it with Node's readline
jest.mock('readline', () => ({
    createInterface: jest.fn(() => ({
      question: jest.fn((q, cb) => cb('mock answer')),
      close: jest.fn(),
    })),
}));


const Coach = require('./Coach.js');
const UserDao = require('../model/UserDao.js'); 
jest.mock('../model/UserDao');



describe("Coach Account Tests", function() {
    beforeEach(() => {
        jest.clearAllMocks(); // read to clear mocks before each test
    });

    test("create a new coach account", async()  =>{
        const coach = new Coach();
        UserDao.create.mockResolvedValue(true);

        coach.userInput = {
            name: "Loren Kim",           
            email: "loren@example.com",
            phone: "1234567890",
            password: "password123",
        };

        coach.name = jest.fn();
        coach.email = jest.fn();
        coach.phone = jest.fn();
        coach.password = jest.fn();

        await coach.createAccount();
    
        expect(UserDao.create).toHaveBeenCalledWith(coach.userInput);
        expect(coach.userInput.name).toBe("Loren Kim");
        expect(coach.userInput.email).toBe("loren@example.com");
        expect(coach.userInput.phone).toBe("1234567890");
        expect(coach.userInput.password).toBe("password123");
    
    });

});

describe("Coach Input Validation Tests", function () {
    let coach;
    
    beforeEach(() => {
        coach = new Coach();
        console.log = jest.fn();
    });

    test("name() should accept valid name", async () => {
        coach.ask = jest.fn().mockResolvedValueOnce("Jane Doe");
        await coach.name();
        expect(coach.userInput.name).toBe("Jane Doe");
    });

    test("email() should accept valid email", async () => {
        coach.ask = jest.fn().mockResolvedValueOnce("test@email.com");
        await coach.email();
        expect(coach.userInput.email).toBe("test@email.com");
    });

    test("phone() should accept valid phone number", async () => {
        coach.ask = jest.fn().mockResolvedValueOnce("1234567890");
        await coach.phone();
        expect(coach.userInput.phone).toBe("1234567890");
    });

    test("phone() should re-prompt on invalid phone", async () => {
        coach.ask = jest.fn()
          .mockResolvedValueOnce("abc")  
          .mockResolvedValueOnce("1234567890"); 
        await coach.phone();
        expect(console.log).toHaveBeenCalledWith("Phone number must be at least 10 digits and only numbers.");
        expect(coach.userInput.phone).toBe("1234567890");
    });

    test("password() should accept valid password", async () => {
        coach.ask = jest.fn().mockResolvedValueOnce("abcd1234");
        await coach.password();
        expect(coach.userInput.password).toBe("abcd1234");
    });

    test("password() should re-prompt if password too short", async () => {
        coach.ask = jest.fn()
          .mockResolvedValueOnce("123") 
          .mockResolvedValueOnce("abcd"); 
        await coach.password();
        expect(console.log).toHaveBeenCalledWith("Password must be at least 4 characters long.");
        expect(coach.userInput.password).toBe("abcd");
    });
});


describe("Coach ask() method", () => {
    test("should resolve user input correctly", async () => {
      const coach = new Coach();
  
      coach.rl.question = jest.fn((question, callback) => {
        callback("test answer");
      });
  
      const result = await coach.ask("Enter something: ");
      expect(result).toBe("test answer");
      expect(coach.rl.question).toHaveBeenCalledWith("Enter something: ", expect.any(Function));
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

        await coach.choice();
        expect(coach.createAccount).toHaveBeenCalled();
    });

    test("choice() should call changeEmail() when input is '2'", async () => {
        const coach = new Coach();
        coach.ask = jest.fn().mockResolvedValue("2");
        coach.changeEmail = jest.fn();
    
        await coach.choice();
        expect(coach.changeEmail).toHaveBeenCalled();
    });

    test("choice() should call deleteAccount() when input is '3'", async () => {
        const coach = new Coach();
        coach.ask = jest.fn().mockResolvedValue("3");
        coach.deleteAccount = jest.fn();
    
        await coach.choice();
        expect(coach.deleteAccount).toHaveBeenCalled();
     });

    test("choice() should call viewAccountInfo() when input is '4'", async () => {
        const coach = new Coach();
        coach.ask = jest.fn().mockResolvedValue("4");
        coach.viewAccountInfo = jest.fn();
    
        await coach.choice();
        expect(coach.viewAccountInfo).toHaveBeenCalled();
    });

    test("choice() should close readline when input is '5'", async () => {
        const coach = new Coach();
        coach.ask = jest.fn().mockResolvedValue("5");
        coach.rl.close = jest.fn();
    
        await coach.choice();
        expect(coach.rl.close).toHaveBeenCalled();
    });

    test("choice() should show 'Invalid choice' on bad input", async () => {
        const coach = new Coach();
        coach.ask = jest.fn()
          .mockResolvedValueOnce("9") 
          .mockResolvedValueOnce("5"); 
        coach.menu = jest.fn().mockResolvedValueOnce("9").mockResolvedValueOnce("5");
    
        await coach.choice();
        expect(console.log).toHaveBeenCalledWith("Invalid choice");
    });
});
    
