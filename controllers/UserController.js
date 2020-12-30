const userService = require('../services/UserService')
const { validationResult } = require('express-validator');

login = async (req, res) => {
    try {
        const updatedUser = await userService.updatedUser(req.user)
        res.status(200).json({
            message: 'login success',
            user: updatedUser,
            token: req.token,
            refreshToken: req.refreshToken
        })  
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

logout = async (req, res) => {
    try {
        res.status(200).json({
            message: 'deleted token success',
            token: req.token
        })
    } catch (error) {
        res.status(404).json({message: error.message});
    }  
}

paginate = async (req, res) => {
    try {
        const paginate = await userService.paginate(req)
        res.status(200).json({message: 'success', data: paginate.users})
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
        res.status(200).json({message: 'success', data: user})
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
        res.status(200).json({message: 'success', data: removedUser})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

create = async (req, res) => {
    try {
        const createdUser = await userService.createdUser(req)
        res.status(200).json({message: 'success', user: createdUser})
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
        res.status(200).json({message: 'success', data: updatedUser})
    }catch (error) {
        res.status(404).json({message: error.message})
    }
}

sendMail = async (req, res) => {
    try {
        await userService.sendMail(req)
        res.status(200).json({message: 'Please check your email to reset password'})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

resetPassword = async (req, res) => {
    try {
        await userService.resetPassword(req)
        res.status(200).json({message: 'reset password success'})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

module.exports = {
    login,
    logout,
    paginate,
    show,
    destroy,
    create,
    update,
    sendMail,
    resetPassword
}