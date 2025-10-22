const Coach = require('./Coach.js');
const UserDao = require('model/UserDao'); 
jest.mock('./UserDao');

describe("Coach Account Tests", function() {
  test("create a new coach account + test name", function() {
    const coach = new Coach();
    UserDao.create.mockResolvedValue(true);

    coach.userInput = {
        name: "Loren Kim",           
        email: "loren@example.com",
        phone: "1234567890",
        password: "password123",
        idCoach: 12345
    };
    coach.createAccount();
    expect(UserDao.create).toHaveBeenCalledWith(coach.userInput);
    expect(coach.userInput.name).toBe("Loren Kim");
    expect(coach.userInput.email).toBe("loren@example.com");
    expect(coach.userInput.phone).toBe("1234567890");
    expect(coach.userInput.password).toBe("password123");
    expect(coach.userInput.idCoach).toBe(12345);
  });

});