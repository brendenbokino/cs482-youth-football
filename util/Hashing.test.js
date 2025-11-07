const hash = require('./Hashing');

test('Hashing and Comparing Passwords', async function(){
    let pwd1 = 'Hello';
    let pwd2 = 'hello';

    let hashedpwd = hash.hashString(pwd1);

    let same1 = hash.compareHash(pwd1, hashedpwd);
    let same2 = hash.compareHash(pwd2, hashedpwd);

    expect(hashedpwd).not.toBeNull();
    expect(hashedpwd).not.toEqual(pwd1);    
    expect(same1).toBeTruthy();
    expect(same2).toBeFalsy();
})