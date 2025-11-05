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
        UserDao.readAll.mockResolvedValue([]);

        coach.ask = jest.fn()
            .mockResolvedValueOnce("Loren Kim")
            .mockResolvedValueOnce("loren@example.com")
            .mockResolvedValueOnce("1234567890")
            .mockResolvedValueOnce("password123")
            .mockResolvedValueOnce("lkim_coach")
            .mockResolvedValueOnce("1");
        
        await coach.createAccount();
    
        const expectedInput = {
            name: "Loren Kim",           
            email: "loren@example.com",
            phone: "1234567890",
            password: "password123",
            username: "lkim_coach",
            permission: 1
        };

        expect(UserDao.create).toHaveBeenCalledWith(expectedInput);
        expect(coach.userInput).toEqual(expectedInput);
        expect(coach.ask).toHaveBeenCalledTimes(6);
    });

    test("checkForExistingAccount should return null if no account exists", async () => {
        const coach = new Coach();
        UserDao.readAll.mockResolvedValue([]);
        const result = await coach.checkForExistingAccount("nonexistent@email.com");
        expect(result).toBeNull();
        expect(console.log).not.toHaveBeenCalled();
    });

    test("checkForExistingAccount should return user and log info if account exists", async () => {
        const coach = new Coach();
        const mockUser = { email: "existing@email.com" };
        UserDao.readAll.mockResolvedValue([mockUser]);
        const result = await coach.checkForExistingAccount("existing@email.com");
        expect(result).toEqual(mockUser);
        expect(console.log).toHaveBeenCalledWith("You already have an account \nAccount Info:", mockUser);
    });

});


describe("Coach Input Validation Tests", function () {
    let coach;
    
    beforeEach(() => {
        coach = new Coach();
        console.log = jest.fn();
        UserDao.readAll.mockResolvedValue([]);
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

    test("permission() should re-prompt on non-numeric input", async () => {
        coach.ask = jest.fn()
          .mockResolvedValueOnce("xyz") 
          .mockResolvedValueOnce("2"); 
        await coach.permission();
        expect(console.log).toHaveBeenCalledWith("Permission must be a number.");
        expect(coach.userInput.permission).toBe(2);
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
        jest.spyOn(console, 'log').mockImplementation(() => {}); /// looked up how to mock user input
        await coach.menu(); 

        expect(console.log).toHaveBeenCalledWith("Coach Menu:");
        expect(console.log).toHaveBeenCalledWith("1. Create Account");
        expect(console.log).toHaveBeenCalledWith("2. Update Account");
        expect(console.log).toHaveBeenCalledWith("3. Delete Account");
        expect(console.log).toHaveBeenCalledWith("4. View Account Info");
        expect(console.log).toHaveBeenCalledWith("5. Exit");
    });

    test("choice() should call createAccount() when input is '1'", async () => {
        const coach = new Coach();
        coach.createAccount = jest.fn();
        await coach.choice('1');
        expect(coach.createAccount).toHaveBeenCalled();
    });

    test("choice() should call updateAccount() when input is '2'", async () => {
        const coach = new Coach();
        coach.updateAccount = jest.fn();
        await coach.choice('2');
        expect(coach.updateAccount).toHaveBeenCalled();
    });

    test("choice() should call deleteAccount() when input is '3'", async () => {
        const coach = new Coach();
        coach.deleteAccount = jest.fn();
        await coach.choice('3');
        expect(coach.deleteAccount).toHaveBeenCalled();
     });

    test("choice() should call viewAccountInfo() when input is '4'", async () => {
        const coach = new Coach();
        coach.viewAccountInfo = jest.fn();
        await coach.choice('4');
        expect(coach.viewAccountInfo).toHaveBeenCalled();
    });

    test("choice() should close readline when input is '5'", async () => {
        const coach = new Coach();
        coach.rl.close = jest.fn();
        await coach.choice('5');
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

describe("Coach updateAccount Tests", function() {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("viewAccountInfo() logs user info when email exists", async () => {
        coach = new Coach();
        const mockUser = { email: "test@example.com", name: "Jane" };
        UserDao.readAll.mockResolvedValue([mockUser]);
        coach.ask = jest.fn().mockResolvedValue("test@example.com");

        await coach.viewAccountInfo();

        expect(UserDao.readAll).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith("Account Info:", mockUser);
    });

    test("viewAccountInfo() but email doesn't exists", async () => {
        coach = new Coach();
        const mockUser = { email: "test@example.com", name: "Jane" };
        UserDao.readAll.mockResolvedValue([mockUser]);
        coach.ask = jest.fn().mockResolvedValue("test2@example.com");

        await coach.viewAccountInfo();

        expect(console.log).toHaveBeenCalledWith("No account found with that email.");
    });

    test("deleteAccount() and email exists", async () => {
        coach = new Coach();
        const mockUser = { email: "test@example.com", name: "Jane" };
        UserDao.readAll.mockResolvedValue([mockUser]);
        UserDao.del.mockResolvedValue({});
        coach.ask = jest.fn().mockResolvedValue("test@example.com");

        await coach.deleteAccount();
        expect(console.log).toHaveBeenCalledWith("Account deleted successfully.");
    });

    test("deleteAccount() and email doesn't exists", async () => {
        coach = new Coach();
        const mockUser = { email: "test@example.com", name: "Jane" };
        UserDao.readAll.mockResolvedValue([mockUser]);
        UserDao.del.mockResolvedValue({});
        coach.ask = jest.fn().mockResolvedValue("test2@example.com");

        await coach.deleteAccount();
        expect(console.log).toHaveBeenCalledWith("No account found with that email.");
    });

    test("updateAccount() should exit if no user is found for email", async () => {
        UserDao.readAll.mockResolvedValue([]); 
        coach.ask = jest.fn().mockResolvedValueOnce("nonexistent@email.com");

        await coach.updateAccount();

        expect(console.log).toHaveBeenCalledWith("No account found with that email.");
        expect(UserDao.update).not.toHaveBeenCalled();
    });

    test("updateAccount() updates name successfully", async () => {
        coach = new Coach();
        const mockUser = { _id: "123", email: "test@example.com"};
        const updates = { _id: "123", email: "test@example.com", name: "Loren" };

        UserDao.readAll.mockResolvedValue([mockUser]);
        UserDao.update.mockResolvedValue(updates);

        coach.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("1") // 1 for updating name
            .mockResolvedValueOnce("Loren");

        await coach.updateAccount();
        
        expect(UserDao.readAll).toHaveBeenCalled();
        expect(UserDao.update).toHaveBeenCalledWith("123", { name: "Loren" });
        expect(console.log).toHaveBeenCalledWith("Account updated to:", updates);
    });

    test("updateAccount() updates email successfully (choice '2')", async () => {
        const updates = { _id: "123", email: "new@email.com", name: "Jane" };
        UserDao.update.mockResolvedValue(updates);

        coach.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("2") 
            .mockResolvedValueOnce("new@email.com"); 

        await coach.updateAccount();
        
        expect(UserDao.update).toHaveBeenCalledWith("123", { email: "new@email.com" });
    });

    test("updateAccount() updates phone successfully (choice '3')", async () => {
        const updates = { _id: "123", email: "test@email.com", phone: "1112223333" };
        UserDao.update.mockResolvedValue(updates);

        coach.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("3") 
            .mockResolvedValueOnce("1112223333"); 

        await coach.updateAccount();
        
        expect(UserDao.update).toHaveBeenCalledWith("123", { phone: "1112223333" });
    });

    test("updateAccount() updates password successfully (choice '4')", async () => {
        const updates = { _id: "123", email: "test@email.com", password: "newpassword" };
        UserDao.update.mockResolvedValue(updates);

        coach.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("4") 
            .mockResolvedValueOnce("newpassword"); 

        await coach.updateAccount();
        
        expect(UserDao.update).toHaveBeenCalledWith("123", { password: "newpassword" });
    });

    test("updateAccount() handles invalid choice and returns", async () => {
        UserDao.update.mockClear(); 

        coach.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("9"); 

        await coach.updateAccount();
        
        expect(console.log).toHaveBeenCalledWith("Invalid choice");
        expect(UserDao.update).not.toHaveBeenCalled();
    });



});
    