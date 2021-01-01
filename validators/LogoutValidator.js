const userModel = require('../models/user')
const redisHelper = require('../helpers/Redis')
const jwt = require('jsonwebtoken');

logout = async (req, res, next) => {
    try {
        const token = req.headers.authorization.trim().split(" ")[1] || req.body.token || req.query.token
        if(!token){
            return res.status(401).json({
                message: 'no token provided'
            })
        }
        
        try {
            var decodedToken = await jwt.verify(token, process.env.SECRET_KEY)
            if(decodedToken.type !== 'token'){
                return res.status(401).json({
                    message: 'invalid token'
                })
            }
        } catch (jwt_error) {
            res.status(401).json({message: jwt_error.message});
        }

        const user = await userModel.findById(decodedToken.id)
        if(!user){
            return res.status(401).json({
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