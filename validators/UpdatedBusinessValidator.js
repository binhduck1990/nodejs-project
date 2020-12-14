const businessModel = require('../models/business')
const userModel = require('../models/user')

validate = async(req) => {
    const validator = { isError : true }
    const listError = {}

    const business = await businessModel.findById(req.params.id)
 
    if(!business){
        validator.listError = { business : 'business not found' }
        return validator
    }

    if('name' in req.body){
        business.name = req.body.name
    }
    if('active' in req.body){
        business.active = Boolean(req.body.active)
    }
    if('user' in req.body){
        const user = await userModel.findById(req.body.user)
        if(!user){
            validator.listError = { user : 'user not exist' }
            return validator
        }
        business.user = req.body.user
    }
    const err = business.validateSync()
    if(!!err){
        Object.keys(err.errors).forEach((key) => {
            listError[key] = err.errors[key].message
        });
        validator.listError = listError
        return validator
    }

    const checkNameExist = await businessModel.findOne({name: req.body.name, _id: {$ne: req.params.id}})
    if(checkNameExist){
        validator.listError = { name : 'name exist' }
        return validator
    }
    
    validator.isError = false
    validator.business = business
    
    return validator
}

module.exports = {
    validate: validate
}