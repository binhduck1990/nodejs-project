const jwt = require('jsonwebtoken');

generateToken = async (user) => {
    const token = new Promise((resolve, reject) => {
        jwt.sign({ id: user._id, type: 'token' }, process.env.SECRET_KEY, {expiresIn: "3 days"}, function(err, token){
            if(!err){
                resolve(token)
            }
            reject(err)
        })
    })
    return token
}

generateRefreshToken = async (user) => {
    const token = new Promise((resolve, reject) => {
        jwt.sign({ id: user._id, type: 'refreshToken' }, process.env.SECRET_KEY, {expiresIn: "365 days"}, function(err, token){
            if(!err){
                resolve(token)
            }
            reject(err)
        })
    })
    return token
}

generateResetPasswordToken = async (user) => {
    const token = new Promise((resolve, reject) => {
        jwt.sign({ id: user._id, username: user.username, type: 'resetPasswordToken' }, process.env.SECRET_KEY, {expiresIn: "3 days"}, function(err, token){
            if(!err){
                resolve(token)
            }
            reject(err)
        })
    })
    return token
}

module.exports = {
    generateToken, generateRefreshToken, generateResetPasswordToken
}