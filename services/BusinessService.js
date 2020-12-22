const businessModel = require("../models/business");

paginate = async (req) => {
    const paginate = {}

    const perPage = parseInt(req.query.per_page) || 20
    const page = parseInt(req.query.page) || 1
    const offset = perPage*page - perPage;

    const businessQuery = businessModel.find().skip(offset).limit(perPage)
    const totalBusinessQuery = businessModel.countDocuments()

    const loadUser = req.query.load_user

    if(req.query.name){
        businessQuery.where('name', new RegExp(req.query.name, "i"))
        totalBusinessQuery.where('name', new RegExp(req.query.name, "i"))
    }
    if(req.query.active){
        businessQuery.where('active', req.query.active) 
        totalBusinessQuery.where('active', req.query.active)
    }
    // load relation user
    if(loadUser === 'true'){
        businessQuery.populate({
            path: 'user'
        })
    }

    const business = businessQuery.exec()
    const totalBusiness = totalBusinessQuery.exec()

    paginate.business = await business
    paginate.total = await totalBusiness
    
    return paginate
}

createdBusiness = async (business) => {
    return business.save()
}

updatedBusiness = async (business) => {
    return business.save()
}

findBusinessById = async (req) => {
    const loadUser = req.query.load_user
    const business = businessModel.findById(req.params.id)
    if(loadUser === 'true'){
        business.populate({
            path: 'user',
            populate: {
                path: 'business'
            }
        })
    }
    
    return business
}

module.exports = {
    paginate,
    createdBusiness,
    findBusinessById,
    updatedBusiness
}