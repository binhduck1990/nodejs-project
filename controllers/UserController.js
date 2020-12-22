const userModel = require('../models/user')
const userService = require('../services/UserService')
const createdUserValidator = require('../validators/CreatedUserValidator')
const updatedUserValidator = require('../validators/UpdatedUserValidator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

login = async (req, res) => {
    try {
        const user = await userService.findUserByEmail(req)
        if(user){
            const comparedPassword = await bcrypt.compare(req.body.password, user.password)
            if(!comparedPassword){
                return res.status(400).json({message: 'wrong email or password'})
            }
            try {
                var generatedToken = await userService.generateToken(user)
            } catch (jwt_error) {
                res.status(401).json({message: error.message});
            }
            return res.status(200).json({
                message: 'login success',
                token: generatedToken.token,
                refreshToken: generatedToken.refreshToken
            })  
        }
        return res.status(400).json({message: 'wrong email or password'})   
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

logout = async (req, res) => {
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
        
        const tokens = await userService.getTokenFromRedis()
        if(tokens.includes(token)){
            return res.status(200).json({
                message: 'token has been deleted'
            })
        }

        const updatedToken = await userService.setTokenToRedis(token)
        if(updatedToken){
            return res.status(200).json({
                message: 'delete token success'
            })
        }     
    } catch (error) {
        res.status(404).json({message: error.message});
    }  
}

paginate = async (req, res) => {
    try {
        const paginate = await userService.paginate(req)
        res.status(200).json({message: 'success', data: paginate.users, total: paginate.total, token:res.token, refresh_token:res.refresh_token})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

show = async (req, res) => {
    try {
        const user = await userService.findUserById(req)
        if(!user){
            return res.status(400).json({message: 'user not found'})
        }
        res.status(200).json({message: 'success', data: user, token:res.token, refresh_token:res.refresh_token})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

destroy = async (req, res) => {
    try {
        const removedUser = await userService.findUserByIdAndRemove(req.params.id)
        if(!removedUser){
            return res.status(400).json({message: 'user not found'})
        }
        res.status(200).json({message: 'success', data: removedUser, token:res.token, refresh_token:res.refresh_token})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

create = async (req, res) => {
    try {
        const validatedData = await createdUserValidator.validate(req)
        if(validatedData.isError){
            return res.status(400).json({message: validatedData.listError})
        }
        const createdUser = await userService.createdUser(validatedData.user)
        res.status(200).json({message: 'success', data: createdUser, token:res.token, refresh_token:res.refresh_token})
    }catch (error) {
        res.status(404).json({message: error.message})
    }
}

update = async (req, res) => {
    try{
        const validatedData = await updatedUserValidator.validate(req)
        if(validatedData.isError){
            return res.status(400).json({message: validatedData.listError})
        }
        const updatedUser = await userService.updatedUser(validatedData.user)
        res.status(200).json({message: 'success', data: updatedUser, token:res.token, refresh_token:res.refresh_token})
    }catch (error) {
        res.status(404).json(error.message)
    }
}

module.exports = {
    login,
    logout,
    paginate,
    show,
    destroy,
    create,
    update
}