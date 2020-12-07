const userService = require('../services/UserService')
const createdUserValidator = require('../validators/CreatedUserValidator')

// users paginate
paginate = async (req, res) => {
    try {
        const paginate = await userService.paginate(req)
        res.status(200).json({message: 'success', data: paginate.users, total: paginate.total})
    } catch (error) {
        res.status(404).json({message: error})
    }
}

// login
login = async (req, res) => {
    try {
        const user = await userService.findOneUser(req)
        if(!user){
            return res.status(400).json({message: 'wrong user or password'})
        }
        res.status(200).json({message: 'success'})     
    } catch (error) {
        res.status(404).json({message: error});
    }
}

// get user detail
show = async (req, res) => {
    try {
        const user = await userService.findUserById(req.params.id)
        if(!user){
            return res.status(404).json({message: 'user not found'})
        }
        res.status(200).json({message: 'success', data: user})
    } catch (error) {
        res.status(404).json({message: error})
    }
}

// remove user
destroy = async (req, res) => {
    try {
        const removedUser = userService.findUserByIdAndRemove(req.params.id)
        if(!removedUser){
            return res.status(404).json({message: 'user not found'})
        }
        res.status(200).json({message: 'success', data: removedUser})
    } catch (error) {
        res.status(404).json({message: error})
    }
}

// create user
create = async (req, res) => {
    const validatedData = createdUserValidator.validate(req)
    if(Object.getOwnPropertyNames(validatedData).length !== 0){
        return res.status(404).json({message: validatedData})
    }
    try {
        const createdUser = await userService.createdUser(req)
        res.status(201).json({message: 'success', data: createdUser})
    }catch (error) {
        res.status(404).json({message: error})
    }
}

// update user
update = async (req, res) => {
    try{
        const updatedUser = await userService.findUserByIdAndUpdate(req)
        if(!updatedUser){
            return res.status(404).json({message: 'user not found'})
        }
        res.status(200).json({message: 'success', data: updatedUser})
    }catch (error) {
        if (error.kind === "ObjectId") {
            res.status(404).json({message: 'user not found'});
        }else{
            res.status(404).json(error)
        }
    }
}

module.exports = {
    paginate: paginate,
    login: login,
    show: show,
    destroy: destroy,
    create: create,
    update: update
}