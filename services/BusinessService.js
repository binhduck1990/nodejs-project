const businessModel = require("../models/business");

paginate = async (req) => {
    const paginate = {}
    const perPage = parseInt(req.query.per_page) || 2
    const page = parseInt(req.query.page) || 1
    const offset = perPage*page - perPage;
    const businessQuery = businessModel.find().skip(offset).limit(perPage)
    const totalBusinessQuery = businessModel.countDocuments()
    if(req.query.name){
        businessQuery.where('name', new RegExp(req.query.name, "i"))
        totalBusinessQuery.where('name', new RegExp(req.query.name, "i"))
    }
    if(req.query.active){
        businessQuery.where('active', req.query.active) 
        totalBusinessQuery.where('active', req.query.active)    
    }

    const [business, totalBusiness] = await Promise.all([businessQuery.exec(), totalBusinessQuery.exec()])

    paginate.business = business
    paginate.total = totalBusiness
    
    return paginate
}

createdBusiness = async (req) => {
    return businessModel.create({
        name: req.body.name,
        active: req.body.active
    })
}

findBusinessById = (id) => {
    return businessModel.findById(id)
}

updatedBusiness = (business) => {
    return business.save()
}

module.exports = {
    paginate,
    createdBusiness,
    findBusinessById,
    updatedBusiness
}