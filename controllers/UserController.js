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
        res.status(200).json({message: 'success', data: paginate.users, total: paginate.total})
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
            const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {expiresIn: "2 days"})
            return res.status(200).json({
                message: 'login success',
                data: token
            })  
        }
        return res.status(400).json({message: 'wrong email or password'})   
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
    update
}