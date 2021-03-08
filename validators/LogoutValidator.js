const userModel = require('../models/user')
const redisHelper = require('../helpers/Redis')
const jwt = require('jsonwebtoken');

// nếu người dùng logout thì lưu token vào 1 mảng trong redis, token đó sẽ không được sử dụng
logout = async (req, res, next) => {
    try {
        let token = req.headers.authorization
        if(!token){
            return res.status(400).json({
                message: 'no token provided'
            })
        }
        token = token.trim().split(" ")[1]

        try {
            var decodedToken = await jwt.verify(token, process.env.SECRET_KEY)
            if(decodedToken.type !== 'token'){
                return res.status(400).json({
                    message: 'token is invalid'
                })
            }
        } catch (jwt_error) {
            res.status(401).json({message: jwt_error.message});
        }

        const user = await userModel.findById(decodedToken.id)
        if(!user){
            return res.status(400).json({
                message: 'user not found'
            })
        }
        
        const tokens = await redisHelper.getTokenFromRedis()
        if(tokens.includes(token)){
            req.token = token
            return next()
        }

        const updatedToken = await redisHelper.setTokenToRedis(token)
        if(updatedToken){
            req.token = token
            return next()
        }     
    } catch (error) {
        res.status(404).json({message: error.message});
    }  
}

module.exports = {
    logout
}