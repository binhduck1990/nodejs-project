const jwt = require('jsonwebtoken')
const userModel = require('../models/user')
const generatedTokenHelper = require('../helpers/GenrateToken')

refresh = async (req, res, next) => {
    try {
        // kiểm tra refresh_token gửi lên có hợp lệ không
        const refreshToken = req.headers.authorization.trim().split(" ")[1] || req.body.refresh_token || req.query.refresh_token
        if(!refreshToken){
            return res.status(401).json({
                message: 'no refresh_token provided'
            })
        }

        try {
            var decodedToken = await jwt.verify(refreshToken, process.env.SECRET_KEY)
        } catch (decode_token_error) {
            return res.status(401).json({
                message: decode_token_error.message
            })
        }
        // Nếu token hợp lệ thì kiểm tra tiếp các thông tin khác trong token
        
        if(decodedToken && decodedToken.type !== 'refreshToken'){
            return res.status(401).json({
                message: 'invalid refresh_token'
            })
        }

        const user = await userModel.findById(decodedToken.id)
        if(!user){
            return res.status(401).json({
                message: 'user not found'
            })
        }

        if(user.refresh_token != refreshToken){
            return res.status(401).json({
                message: 'invalid refresh_token'
            }) 
        }

        try {
            var [token, newRefreshToken] = await Promise.all([generatedTokenHelper.generateToken(user), generatedTokenHelper.generateRefreshToken(user)])
        } catch (jwt_error) {
            return res.status(401).json({message: jwt_error.message});
        }

        user.refreshToken = newRefreshToken
        req.token = token
        req.refreshToken = newRefreshToken
        req.updatedUser = user
        next() 
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}

module.exports = {
    refresh
}