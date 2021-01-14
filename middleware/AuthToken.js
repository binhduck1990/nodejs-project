const jwt = require('jsonwebtoken')
const userModel = require('../models/user')
const redisHelper = require('../helpers/Redis')

checkToken = async (req, res, next) => {
    try {
        let token = req.headers.authorization
        if(!token){
            return res.status(401).json({
                message: 'no token provided'
            })
        }
        token = token.trim().split(" ")[1]

        try {
            var decodedToken = await jwt.verify(token, process.env.SECRET_KEY)
        } catch (decode_token_error) {
            return res.status(401).json({
                message: decode_token_error.message
            })
        }
        // Nếu token hợp lệ thì kiểm tra tiếp các thông tin khác trong token
        
        if(decodedToken && decodedToken.type !== 'token'){
            return res.status(401).json({
                message: 'invalid token'
            })
        }

        const user = await userModel.findById(decodedToken.id)
        if(!user){
            return res.status(401).json({
                message: 'user not found'
            })
        }

        const tokens = await redisHelper.getTokenFromRedis()
        if(tokens.includes(token)){
            return res.status(401).json({
                message: 'token expired'
            })
        }
        
        req.user = user
        next() 
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })
    }
}

module.exports = {
    checkToken
}