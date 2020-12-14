const businessModel = require('../models/business')
const userModel = require('../models/user')

validate = async (req) => {
    const validator = { isError : true }
    const listError = {}
    const business = new businessModel({
        name: req.body.name,
        active: req.body.active,
        user: req.body.user
    })

    const err = business.validateSync()

    if(!!err){
        Object.keys(err.errors).forEach((key) => {
            listError[key] = err.errors[key].message
        });
        validator.listError = listError
        return validator
    }
    
    if('user' in req.body){
        const user = await userModel.findById(req.body.user)
        if(!user){
            validator.listError = {user: 'user not exist'}
            return validator
        }
    }

    const checkBusinessExist = await businessModel.findOne({name: req.body.name})
    if(checkBusinessExist){
        validator.listError = {name: 'name already exist'}
        return validator
    }

    validator.isError = false
    validator.business = business
    
    return validator
}

module.exports = {
    validate: validate
}