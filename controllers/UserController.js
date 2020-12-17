const user = require('../models/user')
const userService = require('../services/UserService')
const createdUserValidator = require('../validators/CreatedUserValidator')
const updatedUserValidator = require('../validators/UpdatedUserValidator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

// users paginate
paginate = async (req, res) => {
    try {
        const paginate = await userService.paginate(req)
        res.status(200).json({message: 'success', data: paginate.users, total: paginate.total, token:res.token, refreshToken:res.refresh_token})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

// login
login = async (req, res) => {
    try {
        const user = await userService.findOneUser(req)
        if(user){
            const comparePassword = await bcrypt.compare(req.body.password, user.password)
            if(!comparePassword){
                return res.status(400).json({message: 'wrong email or password'})
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
        console.log('error', error)
        res.status(404).json({message: error.message});
    }
}

refreshToken = async (req, res) => {
    try {
        const user = await userService.getUserByRefreshToken(req)
        if(!user){
            return res.status(400).json({message: 'refresh_token invalid'})
        }else{
            const refreshToken = user.refresh_token
            const decodeToken = jwt.verify(refreshToken, process.env.SECRET_KEY)
            if (Date.now() >= decodeToken.exp * 1000) {
                return res.status(401).json({
                    message: 'refresh token expried'
                })
              }
        }
        const token = jwt.sign({ id: user._id, type: 'token' }, process.env.SECRET_KEY, {expiresIn: "2 days"})
        return res.status(200).json({
            message: 'refresh token success',
            token: token,
        }) 
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

// get user detail
show = async (req, res) => {
    try {
        const user = await userService.findUserById(req)
        if(!user){
            return res.status(400).json({message: 'user not found'})
        }
        res.status(200).json({message: 'success', data: user})
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
        res.status(200).json({message: 'success', data: removedUser})
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
        res.status(201).json({message: 'success', data: createdUser})
    }catch (error) {
        res.status(404).json({message: error.message})
    }
}

// update user
update = async (req, res) => {
    try{
        const validatedData = await updatedUserValidator.validate(req)
        if(!(validatedData instanceof user)){
            return res.status(400).json({message: validatedData})
        }
        const updatedUser = await userService.updatedUser(validatedData)
        res.status(200).json({message: 'success', data: updatedUser})
    }catch (error) {
        res.status(404).json(error.message)
    }
}

module.exports = {
    paginate,
    login,
    show,
    destroy,
    create,
    update,
    refreshToken
}