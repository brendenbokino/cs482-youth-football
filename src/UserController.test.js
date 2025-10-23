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


const User = require('../src/UserController');
const dao = require('../model/UserDao');

jest.mock('../model/UserDao');

describe('User Controller Tests', function() {
    beforeEach(() => {
        jest.clearAllMocks(); // read to clear mocks before each test
    });

    test("Create a New User Account", async()  =>{
        const user = new User();
        dao.create.mockResolvedValue(true);

        coach.userInput = {
            name: "Oscar Roat",           
            phone: "1234567890",
            password: "12345",
        };

        user.name = jest.fn();
        user.phone = jest.fn();
        user.password = jest.fn();

        await user.createAccount();
    
        expect(dao.create).toHaveBeenCalledWith(user.userInput);
        expect(user.userInput.name).toBe("Oscar Roat");
        expect(user.userInput.phone).toBe("1234567890");
        expect(user.userInput.password).toBe("12345");
    
    });

    test('Successful Login', async function (){
        let req = { body: {txt_login: 'oscarr@ex.com', txt_pass: '12345'},
                    session: {user: null}};
        let res = { redirect: jest.fn() };
        dao.findLogin - jest.fn( async() => ({login:'oscarr@ex.com', password:'12345'}));
        txt_pass.localeCompare(password) = jest.fn( () => true);
        //need to implement findLogin
        await controller.login(req, res);

        expect(dao.findLogin).toHaveBeenCalled();
        expect(req.session.user).not.toBeNull();
        expect(res.redirect).toHaveBeenCalledWith() //redirect to account page?
    });

    test('Login w/ Wrong Password', async function(){
        let req = { body: {txt_login: 'oscarr@ex.com', txt_pass: '12345'},
                    session: {user: null}};
        let res = { redirect: jest.fn() };
        dao.findLogin - jest.fn( async() => ({login:'oscarr@ex.com', password:'54321'}));
        txt_pass.localeCompare(password) = jest.fn( () => false);

        //need to implement findLogin
        await controller.login(req, res);

        expect(dao.findLogin).toHaveBeenCalled();
        expect(req.session.user).toBeNull();
        expect(res.redirect).toHaveBeenCalledWith() //login page w/ error message
    });

    test('Incorrect Login', async function(){
        let req = { body: {txt_login: 'oscarr@ex.com', txt_pass: '12345'},
                    session: {user: null}};
        let res = { redirect: jest.fn() };
        dao.findLogin = jest.fn( async() => null);

        await controller.login(req, res);

        expect(dao.findLogin).toHaveBeenCalled();
        expect(req.session.user).toBeNull();
        expect(res.redirect).toHaveBeenCalledWith() //login page w/ error message
    });
})