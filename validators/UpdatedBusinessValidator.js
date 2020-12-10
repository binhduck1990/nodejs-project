const businessModel = require('../models/business')

validate = async(req) => {
    const listError = {}
    const business = await businessModel.findById(req.params.id)
    if(!business){
        return {
            business : 'business not found'
        }
    }
    if('name' in req.body){
        business.name = req.body.name
    }
    if('active' in req.body){
        business.active = req.body.active
    }
    const err = business.validateSync()
    if(!!err){
        Object.keys(err.errors).forEach((key) => {
            listError[key] = err.errors[key].message
        });
        return listError
    }
    
    return business
}

module.exports = {
    validate: validate
}