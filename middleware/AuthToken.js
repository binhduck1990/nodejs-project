const jwt = require('jsonwebtoken')
const userModel = require('../models/user')
const redisHelper = require('../helpers/Redis')

checkToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization.trim().split(" ")[1] || req.body.token || req.query.token
        if(!token){
            return res.status(401).json({
                message: 'no token provided'
            })
        }

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
        // token hợp lệ
        req.user = user
        next() 
    } catch (error) {
        // Xử lý lỗi server
        return res.status(404).json({
            message: error.message
        })
    }
}

module.exports = {
    checkToken
}