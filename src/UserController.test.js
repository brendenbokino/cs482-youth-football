const controller = require('../src/UserController');
const dao = require('../model/UserDao');

jest.mock('../model/UserDao');

describe('User Controller Tests', function(){
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