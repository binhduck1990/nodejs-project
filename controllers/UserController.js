const userModel = require('../models/user')
const userService = require('../services/UserService')
const createdUserValidator = require('../validators/CreatedUserValidator')
const updatedUserValidator = require('../validators/UpdatedUserValidator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const redis = require("redis");
const client = redis.createClient({ detect_buffers: true });

login = async (req, res) => {
    try {
        const user = await userService.findOneUser(req)
        if(user){
            const comparePassword = await bcrypt.compare(req.body.password, user.password)
            if(!comparePassword){
                return res.status(400).json({message: 'wrong email or password'})
            }
            const tokenRun = new Promise((resolve, reject) => {
                jwt.sign({ id: user._id, type: 'token' }, process.env.SECRET_KEY, {expiresIn: "2 days"}, function(err, token){
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

            const [token, refreshToken] = await Promise.all([tokenRun, refreshTokenRun])
          
            user.refresh_token =  refreshToken
            await user.save()

            return res.status(200).json({
                message: 'login success',
                token: token,
                refreshToken: refreshToken
            })  
        }
        return res.status(400).json({message: 'wrong email or password'})   
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

logout = async (req, res) => {
    try {
        const token = req.headers.authorization.trim().split(" ")[1]
        if(!token){
            return res.status(401).json({
                message: 'no token provide through header'
            })
        }
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
            client.lrange("tokenDelete", 0, -1, function(get_token_err, value){
                try {
                    if(get_token_err){
                        throw get_token_err
                    }
                    const listTokenDelete = value;
                    if(listTokenDelete.includes(token)){
                        return res.status(200).json({
                            message: 'token has been deleted'
                        })
                    }
                    // global.tokenDelete.push(token)
                    client.lpush("tokenDelete", token , function(set_token_err){
                        try {
                            if(set_token_err){
                                throw set_token_err
                            }
                            res.status(200).json({
                                message: 'delete token success'
                            })
                        } catch (set_token_err) {
                            res.status(404).json({message: set_token_err.message});
                        }
                    })
                } catch (get_token_err) {
                    res.status(404).json({message: get_token_err.message});
                }
            }) 
    } catch (error) {
        res.status(404).json({message: err.message});
    }  
}

// users paginate
paginate = async (req, res) => {
    try {
        const paginate = await userService.paginate(req)
        res.status(200).json({message: 'success', data: paginate.users, total: paginate.total, token:res.token, refresh_token:res.refresh_token})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

// get user detail
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

// remove user
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

// create user
create = async (req, res) => {
    try {
        const validatedData = await createdUserValidator.validate(req)
        if(Object.getOwnPropertyNames(validatedData).length !== 0){
            return res.status(400).json({message: validatedData})
        }
        const createdUser = await userService.createdUser(req)
        res.status(201).json({message: 'success', data: createdUser, token:res.token, refresh_token:res.refresh_token})
    }catch (error) {
        res.status(404).json({message: error.message})
    }
}

// update user
update = async (req, res) => {
    try{
        const validatedData = await updatedUserValidator.validate(req)
        if(!(validatedData instanceof userModel)){
            return res.status(400).json({message: validatedData})
        }
        const updatedUser = await userService.updatedUser(validatedData)
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