const jwt = require('jsonwebtoken')
const userModel = require('../models/user')
const userService = require('../services/UserService')

checkToken = async (req, res, next) => {
    try {
        if(!req.headers.authorization){
            return res.status(401).json({
                message: 'no token provide through header'
            })
        }
        const token = req.headers.authorization.trim().split(" ")[1]
        const decodedToken = await jwt.verify(token, process.env.SECRET_KEY)
        if(decodedToken.type !== 'token'){
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
        const tokens = await userService.getTokenFromRedis()
        if(tokens.includes(token)){
            return res.status(401).json({
                message: 'token expired'
            })
        }
        next()
    } catch (error) {
        if(error.message === 'invalid token'){
            return res.status(401).json({
                message: error.message
            })
        }
        if(error.message === 'invalid signature'){
            return res.status(401).json({
                message: 'invalid secret key'
            })
        }
        // auto refresh a new token if get refresh_token through header as the second parameter
        if(error.message === 'jwt expired'){
            try {
                const refreshToken = req.headers.authorization.trim().split(" ")[2]
                if(!refreshToken){
                    res.status(401).json({
                        message: 'token expired'
                    })
                }
                const decodedRefreshToken = await jwt.verify(refreshToken, process.env.SECRET_KEY)
                const user = await userModel.findOne({_id: decodedRefreshToken.id, refresh_token: refreshToken})
                if(!user){
                    return res.status(401).json({
                        message: 'refresh_token not found'
                    })
                }
                const generatedToken = await userService.generateToken(user)
                res.token = generatedToken.token
                res.refresh_token = generatedToken.refreshToken
                return next()
            } catch (errorWhenRefreshToken) {
                if(errorWhenRefreshToken.message === 'invalid token'){
                    return res.status(401).json({
                        message: 'invalid refresh_token'
                    })
                }
                if(errorWhenRefreshToken.message === 'invalid signature'){
                    return res.status(401).json({
                        message: 'refresh_token invalid secret key'
                    })
                }
                if(errorWhenRefreshToken.message === 'jwt expired'){
                    return res.status(401).json({
                        message: 'refresh_token expired'
                    })
                }
                return res.status(404).json({
                    message: error.message
                })
            }
        }
        return res.status(404).json({
            message: error.message
        })
    }
}

module.exports = {
    checkToken
}