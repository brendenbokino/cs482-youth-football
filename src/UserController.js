const dao = require('../model/UserDao')

exports.login = async function(req, res){
    let plogin = req.body.txt_login;
    let user = await dao.findLogin; //need to implement

    if (user == null){ //login not found
        res.redirect(); //redirect to login page w/ error, NtE
    } else {
        if (req.body.txt_pass.localeCompare(user.password)==0){
            //passwords match
            console.log('successful login');

            req.session.user = user;
            res.redirect() //redirect to account page, NtE
        } else{ //passwords do not match
            res.redirect() //redirect to login page w/ error, NtE

        }
    } 
}