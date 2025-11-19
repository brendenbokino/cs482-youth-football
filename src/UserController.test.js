// src/User.test.js
// Loren Kim - 1/2 User account tests

// replaced mongoose with a mock for jest testing
jest.mock('mongoose', () => ({
    connect: jest.fn().mockResolvedValue(),
    model: jest.fn().mockReturnValue({
      find: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn() 
    }),
    Schema: class {
        static Types = { ObjectId: jest.fn() };
    },
}));

// I was having errors with stdin so I mocked it with Node's readline
jest.mock('readline', () => ({
    createInterface: jest.fn(() => ({
      question: jest.fn((q, cb) => cb('mock answer')),
      close: jest.fn(),
    })),
}));


const UserController = require('./UserController.js');
const User =  UserController.User
const UserDao = require('../model/UserDao.js'); 
const YouthDao = require('../model/YouthDao.js');
const hash = require('../util/Hashing.js');
const { default: expect } = require('expect');
jest.mock('../model/YouthDao.js');
jest.mock('../model/UserDao.js');
jest.mock('../util/Hashing.js');



describe("User Controller Tests", function() {
    beforeEach(() => {
        jest.clearAllMocks(); // read to clear mocks before each test
    });

    test("Create new user account.", async()  =>{
        const user = new User();
        UserDao.create.mockResolvedValue(true);

        user.userInput = {
            name: "Loren Kim",
            username: "lkim",           
            email: "loren@example.com",
            phone: "1234567890",
            permission: 1,
            password: "password123",
        };

        user.name = jest.fn();
        user.username = jest.fn();
        user.email = jest.fn();
        user.permission = jest.fn();
        user.phone = jest.fn();
        user.password = jest.fn();

        await user.createAccount();
    
        expect(UserDao.create).toHaveBeenCalledWith(user.userInput);
        expect(user.userInput.name).toBe("Loren Kim");
        expect(user.userInput.email).toBe("loren@example.com");
        expect(user.userInput.phone).toBe("1234567890");
        expect(user.userInput.password).toBe("password123");
    
    });

});

describe("User Input Validation Tests", function () {
    let user;

    
    beforeEach(() => {
        jest.clearAllMocks(); // read to clear mocks before each test
        user = new User();
        console.log = jest.fn();
    });

    test("name() should accept valid name", async () => {
        user.ask = jest.fn().mockResolvedValueOnce("Jane Doe");
        await user.name();
        expect(user.userInput.name).toBe("Jane Doe");
    });

    test("username() should accept valid username", async () => {
        user.ask = jest.fn().mockResolvedValueOnce("jdoe");
        await user.name();
        expect(user.userInput.name).toBe("jdoe");
    });

    test("email() should accept valid email", async () => {
        user.ask = jest.fn().mockResolvedValueOnce("test@email.com");
        await user.email();
        expect(user.userInput.email).toBe("test@email.com");
    });

    test("permission() should accept valid permission levels", async () => {
        user.ask = jest.fn().mockResolvedValueOnce(1);
        await user.permission();
        expect(user.userInput.permission).toBe(1);
    });

    test("permission() should reprompt on invalid permission levels", async () => {
        user.ask = jest.fn().mockResolvedValueOnce(-1).mockResolvedValueOnce(1);
        await user.permission();
        expect(console.log).toHaveBeenCalledWith("Please enter a valid option, a number 1-4.");
        expect(user.userInput.permission).toBe(1);
    });

    test("phone() should accept valid phone number", async () => {
        user.ask = jest.fn().mockResolvedValueOnce("1234567890");
        await user.phone();
        expect(user.userInput.phone).toBe("1234567890");
    });

    test("phone() should re-prompt on invalid phone", async () => {
        user.ask = jest.fn()
          .mockResolvedValueOnce("abc")  
          .mockResolvedValueOnce("1234567890"); 
        await user.phone();
        expect(console.log).toHaveBeenCalledWith("Phone number must be at least 10 digits and only numbers.");
        expect(user.userInput.phone).toBe("1234567890");
    });

    test("password() should accept valid password", async () => {
        user.ask = jest.fn().mockResolvedValueOnce("abcd1234");
        await user.password();
        expect(hash.hashString()).toHaveBeenCalledWith(user.userInput.password);
        //expect(hash.compareHash(user.userInput.password,"abcd1234")).toBeTruthy();
    });

    test("password() should re-prompt if password too short", async () => {
        user.ask = jest.fn()
          .mockResolvedValueOnce("123") 
          .mockResolvedValueOnce("abcd"); 
        await user.password();
        expect(console.log).toHaveBeenCalledWith("Password must be at least 4 characters long.");
        expect(hash.hashString).toHaveBeenCalledWith("abcd");
        //expect(hash.compareHash(user.userInput.password, "abcd")).toBeTruthy();
    });
});


describe("User ask() method", () => {

    beforeEach(() => {
        jest.clearAllMocks(); // read to clear mocks before each test
    });
   
    test("should resolve user input correctly", async () => {
      const user = new User();
  
      user.rl.question = jest.fn((question, callback) => {
        callback("test answer");
      });
  
      const result = await user.ask("Enter something: ");
      expect(result).toBe("test answer");
      expect(user.rl.question).toHaveBeenCalledWith("Enter something: ", expect.any(Function));
    });
});


describe("User Menu and Choice Tests", function () {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("menu() should display the menu options", async () => {
        const user = new User();
        jest.spyOn(console, 'log').mockImplementation(() => {}); /// looked up how to mock user input
        await user.menu(); 

        expect(console.log).toHaveBeenCalledWith("User CRUD Menu:");
        expect(console.log).toHaveBeenCalledWith("1. Create Account");
        expect(console.log).toHaveBeenCalledWith("2. Update Account");
        expect(console.log).toHaveBeenCalledWith("3. Delete Account");
        expect(console.log).toHaveBeenCalledWith("4. View Account Info");
        expect(console.log).toHaveBeenCalledWith("5. Exit");
    });

    test("choice() should call createAccount() when input is '1'", async () => {
        const user = new User();
        user.createAccount = jest.fn();
        await user.choice('1');
        expect(user.createAccount).toHaveBeenCalled();
    });

    test("choice() should call updateAccount() when input is '2'", async () => {
        const user = new User();
        user.updateAccount = jest.fn();
        await user.choice('2');
        expect(user.updateAccount).toHaveBeenCalled();
    });

    test("choice() should call deleteAccount() when input is '3'", async () => {
        const user = new User();
        user.deleteAccount = jest.fn();
        await user.choice('3');
        expect(user.deleteAccount).toHaveBeenCalled();
     });

    test("choice() should call viewAccountInfo() when input is '4'", async () => {
        const user = new User();
        user.viewAccountInfo = jest.fn();
        await user.choice('4');
        expect(user.viewAccountInfo).toHaveBeenCalled();
    });

    test("choice() should close readline when input is '5'", async () => {
        const user = new User();
        user.rl.close = jest.fn();
        await user.choice('5');
        expect(user.rl.close).toHaveBeenCalled();
    });

    test("choice() should show 'Invalid choice' on bad input", async () => {
        const user = new User();
        user.ask = jest.fn()
          .mockResolvedValueOnce("9") 
          .mockResolvedValueOnce("5"); 
        user.menu = jest.fn().mockResolvedValueOnce("9").mockResolvedValueOnce("5");
    
        await user.choice();
        expect(console.log).toHaveBeenCalledWith("Invalid choice");
    });
});

describe("User updateAccount Tests", function() {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("viewAccountInfo() logs user info when email exists", async () => {
        user = new User();
        const mockUser = { email: "test@example.com", name: "Jane" };
        UserDao.readAll.mockResolvedValue([mockUser]);
        user.ask = jest.fn().mockResolvedValue("test@example.com");

        await user.viewAccountInfo();

        expect(UserDao.readAll).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith("Account Info:", mockUser);
    });

    test("viewAccountInfo() but email doesn't exists", async () => {
        user = new User();
        const mockUser = { email: "test@example.com", name: "Jane" };
        UserDao.readAll.mockResolvedValue([mockUser]);
        user.ask = jest.fn().mockResolvedValue("test2@example.com");

        await user.viewAccountInfo();

        expect(console.log).toHaveBeenCalledWith("No account found with that email.");
    });

    test("deleteAccount() and email exists", async () => {
        user = new User();
        const mockUser = { email: "test@example.com", name: "Jane" };
        UserDao.readAll.mockResolvedValue([mockUser]);
        UserDao.del.mockResolvedValue({});
        user.ask = jest.fn().mockResolvedValue("test@example.com");

        await user.deleteAccount();
        expect(console.log).toHaveBeenCalledWith("Account deleted successfully.");
    });

    test("deleteAccount() and email doesn't exists", async () => {
        user = new User();
        const mockUser = { email: "test@example.com", name: "Jane" };
        UserDao.readAll.mockResolvedValue([mockUser]);
        UserDao.del.mockResolvedValue({});
        user.ask = jest.fn().mockResolvedValue("test2@example.com");

        await user.deleteAccount();
        expect(console.log).toHaveBeenCalledWith("No account found with that email.");
    });

    test("updateAccount() updates name successfully", async () => {
        user = new User();
        const mockUser = { _id: "123", email: "test@example.com"};
        const updates = { _id: "123", email: "test@example.com", name: "Loren" };

        UserDao.readAll.mockResolvedValue([mockUser]);
        UserDao.update.mockResolvedValue(updates);

        user.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("1") // 1 for updating name
            .mockResolvedValueOnce("Loren");

        await user.updateAccount();
        
        expect(UserDao.readAll).toHaveBeenCalled();
        expect(UserDao.update).toHaveBeenCalledWith("123", { name: "Loren" });
        expect(console.log).toHaveBeenCalledWith("Account updated to:", updates);
    });

    test("updateAccount() updates username successfully", async () => {
        user = new User();
        const mockUser = { _id: "123", email: "test@example.com"};
        const updates = { _id: "123", email: "test@example.com", username: "lkim" };

        UserDao.readAll.mockResolvedValue([mockUser]);
        UserDao.update.mockResolvedValue(updates);

        user.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("5") // 5 for updating username
            .mockResolvedValueOnce("lkim");

        await user.updateAccount();
        
        expect(UserDao.readAll).toHaveBeenCalled();
        expect(UserDao.update).toHaveBeenCalledWith("123", { username: "lkim" });
        expect(console.log).toHaveBeenCalledWith("Account updated to:", updates);
    });

    test("updateAccount() updates permission level successfully", async () => {
        user = new User();
        const mockUser = { _id: "123", email: "test@example.com"};
        const updates = { _id: "123", email: "test@example.com", permission: 1 };

        UserDao.readAll.mockResolvedValue([mockUser]);
        UserDao.update.mockResolvedValue(updates);

        user.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("6") // 6 for updating permission
            .mockResolvedValueOnce(1);

        await user.updateAccount();
        
        expect(UserDao.readAll).toHaveBeenCalled();
        expect(UserDao.update).toHaveBeenCalledWith("123", { permission: 1 });
        expect(console.log).toHaveBeenCalledWith("Account updated to:", updates);
    });

    test("updateAccount() updates email successfully", async () => {
        user = new User();
        const mockUser = { _id: "123", email: "test@example.com"};
        const updates = { _id: "123", email: "test2@example.com", name: "Loren" };

        UserDao.readAll.mockResolvedValue([mockUser]);
        UserDao.update.mockResolvedValue(updates);

        user.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("2") // 2 for updating email
            .mockResolvedValueOnce("test2@example.com");

        await user.updateAccount();
        
        expect(UserDao.readAll).toHaveBeenCalled();
        expect(UserDao.update).toHaveBeenCalledWith("123", { email: "test2@example.com" });
        expect(console.log).toHaveBeenCalledWith("Account updated to:", updates);
    });

    test("updateAccount() updates phone successfully", async () => {
        user = new User();
        const mockUser = { _id: "123", email: "test@example.com"};
        const updates = { _id: "123", email: "test@example.com", phone: "1234567890" };

        UserDao.readAll.mockResolvedValue([mockUser]);
        UserDao.update.mockResolvedValue(updates);

        user.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("3") // 3 for updating phone
            .mockResolvedValueOnce("1234567890");

        await user.updateAccount();
        
        expect(UserDao.readAll).toHaveBeenCalled();
        expect(UserDao.update).toHaveBeenCalledWith("123", { phone: "1234567890" });
        expect(console.log).toHaveBeenCalledWith("Account updated to:", updates);
    });

    test("updateAccount() updates password successfully", async () => {
        user = new User();
        const mockUser = { _id: "123", email: "test@example.com"};
        const updates = { _id: "123", email: "test@example.com", password: "Loren" };

        UserDao.readAll.mockResolvedValue([mockUser]);
        UserDao.update.mockResolvedValue(updates);

        user.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("4") // 4 for updating password
            .mockResolvedValueOnce("Loren");

        await user.updateAccount();
        
        expect(UserDao.readAll).toHaveBeenCalled();
        expect(hash.hashString).toHaveBeenCalledWith(updates.password);
        expect(UserDao.update).toHaveBeenCalledWith("123", hash.hashString());
        expect(console.log).toHaveBeenCalledWith("Account updated to:", updates);
    });

    test("updateAccount() updates unsuccessfully", async () => {
        user = new User();
        const mockUser = { _id: "123", email: "test@example.com"};
        const updates = { _id: "123", email: "test@example.com", password: "Loren" };

        await user.updateAccount();
        
        expect(console.log).toHaveBeenCalledWith("No account found with that email.");
    });

    test("updateAccount() invalid option", async () => {
        user = new User();
        const mockUser = { _id: "123", email: "test@example.com"};
        const updates = { _id: "123", email: "test@example.com", password: "Loren" };

        user.ask = jest.fn().mockResolvedValueOnce("test@example.com")
            .mockResolvedValueOnce("7") // 7 doesn't exist
            //.mockResolvedValueOnce("Loren");

        await user.updateAccount();
        
        expect(console.log).toHaveBeenCalledWith("Invalid choice");
    });
});

describe("User login/logout tests.", function() {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Successful Login', async function (){

        let req = { body: {login_id: 'oscarr@ex.com', login_pass: '12345'},
                    session: {user: null}};
        let res = { redirect: jest.fn() };
        UserDao.findLogin = jest.fn( async() => ({login:'oscarr@ex.com', password: 'hashed'}));
        hash.comparePassword = jest.fn( () => true );
        
        await UserController.login(req, res);

        expect(UserDao.findLogin).toHaveBeenCalledWith(req.body.login_id);
        expect(req.session.user).not.toBeNull();
        expect(hash.comparePassword).toHaveBeenCalledWith('12345', 'hashed');
        expect(res.redirect).toHaveBeenCalledWith('/profile.html'); 
    });

    test('Login w/ Wrong Password', async function(){
        let req = { body: {login_id: 'oscarr@ex.com', login_pass: '12345'},
                    session: {user: null}};
        let res = { redirect: jest.fn() };
        UserDao.findLogin = jest.fn( async() => ({login:'oscarr@ex.com', password:'hashed'}));
        hash.comparePassword = jest.fn( () => false );

        await UserController.login(req, res);

        expect(UserDao.findLogin).toHaveBeenCalled();
        expect(req.session.user).toBeNull();
        expect(res.redirect).toHaveBeenCalledWith('/login.html?error=2') //login page w/ error message
    });

    test('Incorrect Login', async function(){
        let req = { body: {login_id: 'oscarr@ex.com', login_pass: '12345'},
                    session: {user: null}};
        let res = { redirect: jest.fn() };
        UserDao.findLogin = jest.fn( async() => null);

        await UserController.login(req, res);

        expect(UserDao.findLogin).toHaveBeenCalled();
        expect(req.session.user).toBeNull();
        expect(res.redirect).toHaveBeenCalledWith('/login.html?error=1') //login page w/ error message
    });

    test('Fetch Logged User',async function(){
        let req = { session: { user: {_id:'a1',permission:1 } }};
        let res = { status: jest.fn(), //mock res.status function
                    send: jest.fn(), //mock res.send()
                    end: jest.fn() //mock res.end()
                }; 
    
        await UserController.loggedUser(req,res);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({_id:'a1',permission:1 });
        expect(res.end).toHaveBeenCalled();
    });

    test('Logout User',async function(){
        let req = { session: { user: {_id:'a1',permission:1 } }};
        let res = { redirect: jest.fn(), //mock res.redirect function
                }; 
    
        await UserController.logout(req,res);
    
        expect(req.session.user).toBeNull(); 
        expect(res.redirect).toHaveBeenCalledWith('/');
    });
    
});

describe("User registration tests.", function() {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    let req = {body: {
            email: 'em@i.l',
            username: 'username',
            name: 'name',
            phone: '123',
            pass: 'password'
        }}
    let res = { redirect: jest.fn() };

    test('Registration fails because existing username', async function() {
        UserDao.findLogin = jest.fn( async() => ({username:'username'}));

        await UserController.register(req, res);

        expect(UserDao.findLogin).toHaveBeenCalled();
        expect(UserDao.findLogin).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('User already exists with username.');
        expect(res.redirect).toHaveBeenCalledWith('/register.html')

    })

    test('Registration fails because existing email', async function() {
        UserDao.findLogin = jest.fn().mockResolvedValueOnce(null)
                                    .mockResolvedValueOnce({email: 'em@i.l'});

        await UserController.register(req, res);

        expect(UserDao.findLogin).toHaveBeenCalled();
        expect(UserDao.findLogin).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('User already exists with email.');
        expect(res.redirect).toHaveBeenCalledWith('/register.html')

    })

    test('Registration fails because of password confirmation', async function() {
        UserDao.findLogin.mockResolvedValue(null);

        await UserController.register(req, res);

        expect(UserDao.findLogin).toHaveBeenCalled();
        expect(UserDao.findLogin).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('Confirm password failed on registration.');
        expect(res.redirect).toHaveBeenCalledWith('/register.html');

    })
    
    test('Registration succeeds', async function() {
        req.body.confirm_pass = 'password';
        UserDao.findLogin.mockResolvedValue(null);
        UserDao.create.mockResolvedValue(null);

        await UserController.register(req, res);

        expect(UserDao.findLogin).toHaveBeenCalled();
        expect(UserDao.findLogin).toHaveBeenCalled();
        expect(UserDao.create).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('Successfully registered user.');
        expect(res.redirect).toHaveBeenCalledWith('/profile.html');

    })
});


describe("UserController Youth Tests", function() {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Create Youth Account: No user session", async function() {
        let req = { session: { user: null},
                    body: {} };
        let res = { status: jest.fn(), send: jest.fn() };
        UserDao.read.mockResolvedValue(null);

        await UserController.createYouthAccount(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Forbidden: Not logged in");
    })

    test("Create Youth Account: Requesting user does not exist", async function() {
        let req = { session: { user: {_id: 'u1' }},
                    body: {} };
        let res = { status: jest.fn(), send: jest.fn() };
        UserDao.read.mockResolvedValue(null);

        await UserController.createYouthAccount(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Requesting user not found");
    })

    test("Create Youth Account: Requester not adult", async function() {
        let req = { session: { user: {_id: 'u1', permission: 3} },
                    body: {} };
        let res = { status: jest.fn(), send: jest.fn() };
        UserDao.read.mockResolvedValue({ _id: 'u1', permission: 3 });
        await UserController.createYouthAccount(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Forbidden: Not an adult");
    })
    
    test("Create Youth Account: Successful Creation", async function() {
        let req = { session: { user: {_id: 'u1', permission: 2} },
                    body: {
                        name: 'Youth User',
                        username: 'youthuser',
                        password: 'password',
                    } };
        let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };
        UserDao.read.mockResolvedValue({ _id: 'a1', permission: 2 });
        UserDao.create.mockResolvedValue({ _id: 'u1', ...req.body });
        YouthDao.create.mockResolvedValue({ _id: 'y1', id_user: 'u1', id_adult: 'a1' });
        await UserController.createYouthAccount(req, res);
        expect(UserDao.create).toHaveBeenCalledWith({
            name: 'Youth User',
            username: 'youthuser',
            password: undefined,
            permission: 3
        });

        expect(YouthDao.create).toHaveBeenCalledWith({
            id_user: 'u1',
            id_adult: 'a1'
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

});


describe("UserController getUserById Tests", function() {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getUserById: Not logged in", async function() {
        const req = { session: {}, params: { id: 'u1' } };
        const res = { status: jest.fn(), send: jest.fn() };

        await UserController.getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Forbidden: Not logged in");
    });

    test("getUserById: Requesting user not found", async function() {
        const req = { session: { user: { _id: 'a1' } }, params: { id: 'u2' } };
        const res = { status: jest.fn(), send: jest.fn() };

        UserDao.read.mockResolvedValueOnce(null);

        await UserController.getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Requesting user not found");
    });

    test("getUserById: Target user not found", async function() {
        const req = { session: { user: { _id: 'a1' } }, params: { id: 'u2' } };
        const res = { status: jest.fn(), send: jest.fn() };

        UserDao.read
            .mockResolvedValueOnce({ _id: 'a1', permission: 2 }) // requester
            .mockResolvedValueOnce(null); // target user

        await UserController.getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("User not found");
    });

    test("getUserById: Youth trying to view another user (forbidden)", async function() {
        const req = { session: { user: { _id: 'y1' } }, params: { id: 'u2' } };
        const res = { status: jest.fn(), send: jest.fn() };

        UserDao.read
            .mockResolvedValueOnce({ _id: 'y1', permission: 3 }) // requester = youth
            .mockResolvedValueOnce({ _id: 'u2', permission: 3 }); // target youth

        await UserController.getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Forbidden: Not authorized to view this user");
    });

    test("getUserById: Guest trying to view another user (forbidden)", async function() {
        const req = { session: { user: { _id: 'g1' } }, params: { id: 'u2' } };
        const res = { status: jest.fn(), send: jest.fn() };

        UserDao.read
            .mockResolvedValueOnce({ _id: 'g1', permission: 4 }) // guest
            .mockResolvedValueOnce({ _id: 'u2', permission: 3 });

        await UserController.getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Forbidden: Not authorized to view this user");
    });

    test("getUserById: Adult viewing unrelated youth (forbidden)", async function() {
        const req = { session: { user: { _id: 'a1' } }, params: { id: 'u2' } };
        const res = { status: jest.fn(), send: jest.fn() };

        UserDao.read
            .mockResolvedValueOnce({ _id: 'a1', permission: 2 }) // requester = adult
            .mockResolvedValueOnce({ _id: 'u2', permission: 3 }); // target youth

        YouthDao.findByUserId.mockResolvedValue({ _id: 'y1' });
        YouthDao.isYouthUnderAdult.mockResolvedValue(false);

        await UserController.getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Forbidden: Not authorized to view this youth");
    });

    test("getUserById: Adult viewing youth under them (success)", async function() {
        const req = { session: { user: { _id: 'a1' } }, params: { id: 'u2' } };
        const res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

        UserDao.read
            .mockResolvedValueOnce({ _id: 'a1', permission: 2 })
            .mockResolvedValueOnce({ _id: 'u2', permission: 3 });

        YouthDao.findByUserId.mockResolvedValue({ _id: 'y1' });
        YouthDao.isYouthUnderAdult.mockResolvedValue(true);

        await UserController.getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ _id: 'u2', permission: 3 });
    });

    test("getUserById: Adult trying to view another adult (forbidden)", async function() {
        const req = { session: { user: { _id: 'a1' } }, params: { id: 'a2' } };
        const res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

        UserDao.read
            .mockResolvedValueOnce({ _id: 'a1', permission: 2 }) // requester = adult
            .mockResolvedValueOnce({ _id: 'a2', permission: 2 }); // target = adult

        await UserController.getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Forbidden: Adults can only their youths profiles and their own");
    });

    test("getUserById: Requesting own profile (any role, success)", async function() {
        const req = { session: { user: { _id: 'u1', permission: 3 } }, params: { id: 'u1' } };
        const res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

        UserDao.read
            .mockResolvedValueOnce({ _id: 'u1', permission: 3 })
            .mockResolvedValueOnce({ _id: 'u1', permission: 3 });

        await UserController.getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ _id: 'u1', permission: 3 });
    });
});


describe("UserController promoteToAdult Tests", function() {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("promoteToAdult: Not logged in", async function() {
        let req = { body: { promote_adult_id: 'u2' }, session: { } };
        let res = { status: jest.fn(), send: jest.fn() };

        UserDao.read.mockResolvedValue(null);

        await UserController.promoteToAdult(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Forbidden: Not logged in");
    });

    test("promoteToAdult: Requester not admin or adult (forbidden)", async function() {
        let req = { body: { promote_adult_id: 'u2' }, session: { user: { _id: 'a1' } } };
        let res = { status: jest.fn(), send: jest.fn() };

        UserDao.read.mockResolvedValue({ _id: 'a1', permission: 3 }); // not admin/adult

        await UserController.promoteToAdult(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Forbidden");
    });

    test("promoteToAdult: Target user not found", async function() {
        let req = { body: { promote_adult_id: 'u2' }, session: { user: { _id: 'a1' } } };
        let res = { status: jest.fn(), send: jest.fn() };

        UserDao.read.mockResolvedValueOnce({ _id: 'a1', permission: 1 }); // admin
        UserDao.findLogin.mockResolvedValue(null);

        await UserController.promoteToAdult(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("User not found");
    });

    test("promoteToAdult: Target user not guest", async function() {
        let req = { body: { promote_adult_id: 'u2' }, session: { user: { _id: 'a1' } } };
        let res = { status: jest.fn(), send: jest.fn() };

        UserDao.read.mockResolvedValue({ _id: 'a1', permission: 1 }); // admin
        UserDao.findLogin.mockResolvedValue({ _id: 'u2', permission: 3 }); // not guest

        await UserController.promoteToAdult(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("User is not a guest");
    });

    test("promoteToAdult: Successful promotion", async function() {
        let req = { body: { promote_adult_id: 'u2' }, session: { user: { _id: 'a1' } } };
        let res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

        UserDao.read.mockResolvedValue({ _id: 'a1', permission: 0 }); // admin
        UserDao.findLogin.mockResolvedValue({ _id: 'u2', permission: 4 }); // guest
        UserDao.update.mockResolvedValue({ _id: 'u2', permission: 2 });

        await UserController.promoteToAdult(req, res);
        expect(UserDao.update).toHaveBeenCalledWith('u2', { permission: 2 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ _id: 'u2', permission: 2 });
    });
});

describe("UserController getYouths Tests", function() {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getYouths: No user session", async function() {
        const req = { session: { user: null } };
        const res = { status: jest.fn(), send: jest.fn() };

        await UserController.getYouths(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Forbidden: Not logged in");
    });

    test("getYouths: Requesting user not found", async function() {
        const req = { session: { user: { _id: 'u1' } } };
        const res = { status: jest.fn(), send: jest.fn() };

        UserDao.read.mockResolvedValue(null);

        await UserController.getYouths(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Requesting user not found");
    });

    test("getYouths: Adult requests their youths (success)", async function() {
        const req = { session: { user: { _id: 'adult1' } } };
        const res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

        const mockYouthList = [
            { _id: 'y1', id_adult: 'adult1' },
            { _id: 'y2', id_adult: 'adult1' },
        ];

        UserDao.read.mockResolvedValue({ _id: 'adult1', permission: 2 });
        YouthDao.findByAdultId.mockResolvedValue(mockYouthList);

        await UserController.getYouths(req, res);

        expect(YouthDao.findByAdultId).toHaveBeenCalledWith('adult1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockYouthList);
    });

    test("getYouths: Coach requests all youths (success, filters noTeamYouth)", async function() {
        const req = { session: { user: { _id: 'coach1' } } };
        const res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };

        const allYouths = [
            { _id: 'y1', id_team: 't1' },
            { _id: 'y2', id_team: null },
            { _id: 'y3', id_team: undefined },
        ];

        UserDao.read.mockResolvedValue({ _id: 'coach1', permission: 1 });
        YouthDao.readAllYouth.mockResolvedValue(allYouths);

        await UserController.getYouths(req, res);

        // Only the ones with no team should be returned
        const expected = [
            { _id: 'y2', id_team: null },
            { _id: 'y3', id_team: undefined },
        ];

        expect(YouthDao.readAllYouth).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expected);
    });

    test("getYouths: Unauthorized role (guest/youth)", async function() {
        const req = { session: { user: { _id: 'guest1' } } };
        const res = { status: jest.fn(), send: jest.fn() };

        UserDao.read.mockResolvedValue({ _id: 'guest1', permission: 4 });

        await UserController.getYouths(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Forbidden: Not an adult or coach");
    });
});

describe("UserController addYouthStat Tests", function() {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("addYouthStat: No user session", async function() {
        const req = { 
            session: {}, 
            body: { userId: 'u1', statType: 'touchdown', value: 1, gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        await UserController.addYouthStat(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized. Admin access required." });
    });

    test("addYouthStat: User not admin (coach)", async function() {
        const req = { 
            session: { user: { _id: 'c1', permission: 1 } }, 
            body: { userId: 'u1', statType: 'touchdown', value: 1, gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        await UserController.addYouthStat(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized. Admin access required." });
    });

    test("addYouthStat: User not admin (adult)", async function() {
        const req = { 
            session: { user: { _id: 'a1', permission: 2 } }, 
            body: { userId: 'u1', statType: 'touchdown', value: 1, gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        await UserController.addYouthStat(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized. Admin access required." });
    });

    test("addYouthStat: Missing userId", async function() {
        const req = { 
            session: { user: { _id: 'admin1', permission: 0 } }, 
            body: { statType: 'touchdown', value: 1, gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        await UserController.addYouthStat(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "userId, statType, value, and gameId are required" });
    });

    test("addYouthStat: Missing statType", async function() {
        const req = { 
            session: { user: { _id: 'admin1', permission: 0 } }, 
            body: { userId: 'u1', value: 1, gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        await UserController.addYouthStat(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "userId, statType, value, and gameId are required" });
    });

    test("addYouthStat: Missing value", async function() {
        const req = { 
            session: { user: { _id: 'admin1', permission: 0 } }, 
            body: { userId: 'u1', statType: 'touchdown', gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        await UserController.addYouthStat(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "userId, statType, value, and gameId are required" });
    });

    test("addYouthStat: Missing gameId", async function() {
        const req = { 
            session: { user: { _id: 'admin1', permission: 0 } }, 
            body: { userId: 'u1', statType: 'touchdown', value: 1 } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        await UserController.addYouthStat(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "userId, statType, value, and gameId are required" });
    });

    test("addYouthStat: Youth not found for userId", async function() {
        const req = { 
            session: { user: { _id: 'admin1', permission: 0 } }, 
            body: { userId: 'u1', statType: 'touchdown', value: 1, gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        YouthDao.findByUserId.mockResolvedValue(null);

        await UserController.addYouthStat(req, res);

        expect(YouthDao.findByUserId).toHaveBeenCalledWith('u1');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Youth not found for this user" });
    });

    test("addYouthStat: Successful stat addition (new stats array)", async function() {
        const req = { 
            session: { user: { _id: 'admin1', permission: 0 } }, 
            body: { userId: 'u1', statType: 'touchdown', value: 2, gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        const mockYouth = { 
            _id: 'y1', 
            id_user: 'u1', 
            id_adult: 'a1',
            stats: null // No existing stats
        };
        const updatedYouth = {
            _id: 'y1',
            id_user: 'u1',
            id_adult: 'a1',
            stats: [
                { type: 'touchdown', value: 2, game: 'g1' }
            ]
        };

        YouthDao.findByUserId.mockResolvedValue(mockYouth);
        YouthDao.update.mockResolvedValue(updatedYouth);

        await UserController.addYouthStat(req, res);

        expect(YouthDao.findByUserId).toHaveBeenCalledWith('u1');
        expect(YouthDao.update).toHaveBeenCalledWith('y1', {
            stats: [{ type: 'touchdown', value: 2, game: 'g1' }]
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, youth: updatedYouth });
    });

    test("addYouthStat: Successful stat addition (existing stats array)", async function() {
        const req = { 
            session: { user: { _id: 'admin1', permission: 0 } }, 
            body: { userId: 'u1', statType: 'tackle', value: 5, gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        const existingStat = { type: 'touchdown', value: 2, game: 'g1' };
        const mockYouth = { 
            _id: 'y1', 
            id_user: 'u1', 
            id_adult: 'a1',
            stats: [existingStat]
        };
        const updatedYouth = {
            _id: 'y1',
            id_user: 'u1',
            id_adult: 'a1',
            stats: [
                existingStat,
                { type: 'tackle', value: 5, game: 'g1' }
            ]
        };

        YouthDao.findByUserId.mockResolvedValue(mockYouth);
        YouthDao.update.mockResolvedValue(updatedYouth);

        await UserController.addYouthStat(req, res);

        expect(YouthDao.findByUserId).toHaveBeenCalledWith('u1');
        expect(YouthDao.update).toHaveBeenCalledWith('y1', {
            stats: [
                existingStat,
                { type: 'tackle', value: 5, game: 'g1' }
            ]
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, youth: updatedYouth });
    });

    test("addYouthStat: Value as string converted to int", async function() {
        const req = { 
            session: { user: { _id: 'admin1', permission: 0 } }, 
            body: { userId: 'u1', statType: 'touchdown', value: '10', gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        const mockYouth = { 
            _id: 'y1', 
            id_user: 'u1', 
            id_adult: 'a1',
            stats: []
        };
        const updatedYouth = {
            _id: 'y1',
            stats: [{ type: 'touchdown', value: 10, game: 'g1' }]
        };

        YouthDao.findByUserId.mockResolvedValue(mockYouth);
        YouthDao.update.mockResolvedValue(updatedYouth);

        await UserController.addYouthStat(req, res);

        expect(YouthDao.update).toHaveBeenCalledWith('y1', {
            stats: [{ type: 'touchdown', value: 10, game: 'g1' }]
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("addYouthStat: Invalid value defaults to 0", async function() {
        const req = { 
            session: { user: { _id: 'admin1', permission: 0 } }, 
            body: { userId: 'u1', statType: 'touchdown', value: 'invalid', gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        const mockYouth = { 
            _id: 'y1', 
            id_user: 'u1', 
            id_adult: 'a1',
            stats: []
        };
        const updatedYouth = {
            _id: 'y1',
            stats: [{ type: 'touchdown', value: 0, game: 'g1' }]
        };

        YouthDao.findByUserId.mockResolvedValue(mockYouth);
        YouthDao.update.mockResolvedValue(updatedYouth);

        await UserController.addYouthStat(req, res);

        expect(YouthDao.update).toHaveBeenCalledWith('y1', {
            stats: [{ type: 'touchdown', value: 0, game: 'g1' }]
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("addYouthStat: Failed to update youth", async function() {
        const req = { 
            session: { user: { _id: 'admin1', permission: 0 } }, 
            body: { userId: 'u1', statType: 'touchdown', value: 1, gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        const mockYouth = { 
            _id: 'y1', 
            id_user: 'u1', 
            id_adult: 'a1',
            stats: []
        };

        YouthDao.findByUserId.mockResolvedValue(mockYouth);
        YouthDao.update.mockResolvedValue(null);

        await UserController.addYouthStat(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to update youth stats" });
    });

    test("addYouthStat: Error during database operation", async function() {
        const req = { 
            session: { user: { _id: 'admin1', permission: 0 } }, 
            body: { userId: 'u1', statType: 'touchdown', value: 1, gameId: 'g1' } 
        };
        const res = { status: jest.fn(), json: jest.fn() };

        YouthDao.findByUserId.mockRejectedValue(new Error('Database connection error'));

        await UserController.addYouthStat(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to add stat: Database connection error" });
    });
});



// last Jest tests I tried to write but couldn't get working properly


//describe("run tests", function() {
//    test("run() works properly", async () => {
//        user = new User();
//        expect(console.log).toHaveBeenCalledWith("To update your account, please enter a corresponding number:");
    
//    });

    // from User.js so I don't have to keep flipping files
    //async run() {
    //    let exit = false;
    //    while (!exit) {
    //        await this.menu();
    //        const userChoice = await this.ask("Enter your choice: ");
    //        exit = await this.choice(userChoice);

     //   }
    //    this.rl.close();
    //}
//});