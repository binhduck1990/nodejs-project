const business = require('../models/business')
const businessService = require('../services/BusinessService')
const createdBusinessValidator = require('../validators/CreatedBusinessValidator')
const updatedBusinessValidator = require('../validators/UpdatedBusinessValidator')

// business paginate
paginate = async (req, res) => {
    try {
        const paginate = await businessService.paginate(req)
        res.status(200).json({message: 'success', data: paginate.business, total: paginate.total})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

// create business
create = async (req, res) => {
    try {
        const validator = await createdBusinessValidator.validate(req)
        if(validator.isError){
            return res.status(400).json({message: validator.listError})
        }
        const createdBusiness = await businessService.createdBusiness(validator.business)
        res.status(201).json({message: 'success', data: createdBusiness})
    }catch (error) {
        res.status(404).json({message: error.message})
    }
}

// update business
update = async (req, res) => {
    try{
        const validator = await updatedBusinessValidator.validate(req)
        if(validator.isError){
            return res.status(400).json({message: validator.listError})
        }
        const updatedBusiness = await businessService.updatedBusiness(validator.business)
        res.status(200).json({message: 'success', data: updatedBusiness})
    }catch (error) {
        res.status(404).json({message: error.message})
    }
}

// detail business
show = async (req, res) => {
    try {
        const business = await businessService.findBusinessById(req)
        if(!business){
            return res.status(400).json({message: 'business not found'})
        }
        res.status(200).json({message: 'success', data: business})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

module.exports = {
    paginate,
    create,
    show,
    update
}