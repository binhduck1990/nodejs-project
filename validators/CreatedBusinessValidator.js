const businessModel = require('../models/business')

validate = async (req) => {
    const listError = {}
    const business = new businessModel({
        name: req.body.name,
        active: req.body.active
    })

    const findBusiness = await businessModel.findOne({name: req.body.name})
    if(findBusiness){
        return {
            message: 'business exist'
        }
    }

    const err = business.validateSync()
    if(!!err){
        Object.keys(err.errors).forEach((key) => {
            listError[key] = err.errors[key].message
        });
    }
    return listError
}

module.exports = {
    validate: validate
}