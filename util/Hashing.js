const bcrypt = require('bcrypt');

exports.hashString = function(str) { 
    const salt = bcrypt.genSaltSync(6);
    const hash = bcrypt.hashSync(str, salt);
    return hash;
}

exports.compareHash = function(string, hash){
    return bcrypt.compareSync(string, hash);
}