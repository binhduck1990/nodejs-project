const jwt = require('jsonwebtoken')
const userModel = require('../models/user')

checkToken = async (req, res, next) => {
    console.log('fuck', req.headers.authorization)
    try {
        if(!req.headers.authorization){
            return res.status(401).json({
                message: 'no token provide through header'
            })
        }
        const token = req.headers.authorization.trim().split(" ")[1]
        const decodeToken = await jwt.verify(token, process.env.SECRET_KEY)
        if(decodeToken.type !== 'token'){
            return res.status(401).json({
                message: 'invalid token'
            })
        }

        const user = await userModel.findById(decodeToken.id)
        if(!user){
            return res.status(401).json({
                message: 'user not found'
            })
        }
        console.log(111)
        next()
    } catch (error) {
        if(error.message === 'invalid token'){
            return res.status(401).json({
                message: error.message
            })
        }else if(error.message === 'jwt expired'){
            try {
                const refreshToken = req.headers.authorization.trim().split(" ")[2]
                if(!refreshToken){
                    res.status(404).json({
                        message: 'jwt expired'
                    })
                }
                const decodeRefreshToken = await jwt.verify(refreshToken, process.env.SECRET_KEY)
                const user = await userModel.findOne({_id: decodeRefreshToken.id, refresh_token: refreshToken})
                if(!user){
                    return res.status(401).json({
                        message: 'refresh_token not found'
                    })
                }
                const tokenRun = new Promise((resolve, reject) => {
                    jwt.sign({ id: user._id, type: 'token' }, process.env.SECRET_KEY, {expiresIn: "100"}, function(err, token){
                        if(!err){
                            resolve(token)
                        }
                        reject(err)
                    })
                })
                const refreshTokenRun = new Promise((resolve, reject) => {
                    jwt.sign({ id: user._id, type: 'refreshToken' }, process.env.SECRET_KEY, {expiresIn: "30 days"}, function(err, token){
                        if(!err){
                            resolve(token)
                        }
                        reject(err)
                    })
                })
    
                const [newToken, newRefreshToken] = await Promise.all([tokenRun, refreshTokenRun])
                user.refresh_token = newRefreshToken
                await user.save()
                res.token = newToken
                res.refresh_token = newRefreshToken
                next()
            } catch (e) {
                return res.status(404).json({
                    message: e.message
                })
            }
        }else{
            res.status(404).json({
                message: error.message
            })
        }
    }
}

module.exports = {
    checkToken
}