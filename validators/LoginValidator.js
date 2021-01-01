const userModel = require('../models/user')
const generatedTokenHelper = require('../helpers/GenrateToken')
const bcrypt = require('bcrypt')

login = async (req, res, next) => {
    try {
        const user = await userModel.findOne({email: req.body.email})
        if(user){
            const comparedPassword = await bcrypt.compare(req.body.password, user.password)
            if(!comparedPassword){
                return res.status(400).json({message: 'wrong email or password'})
            }
            try {
                var token = await Promise.all([generatedTokenHelper.generateToken(user), generatedTokenHelper.generateRefreshToken(user)])
            } catch (jwt_error) {
                return res.status(401).json({message: jwt_error.message});
            }
            user.refreshToken = refreshToken
            req.user = user
            req.token = token
            req.refreshToken = refreshToken
            return next() 
        }
        return res.status(400).json({message: 'wrong email or password'})   
    } catch (error) {
        return res.status(404).json({message: error.message});
    }
}

module.exports = {
    login
}