const userModel = require('../models/user');
const businessModel = require('../models/business')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const redis = require("redis");
const client = redis.createClient({ detect_buffers: true });

findUserById = async (req) => {
    const user = await userModel.findById(req.params.id)
    if(!user){
        return null
    }
    const loadBusiness = req.query.load_business
    if(loadBusiness === 'true'){
        const business = await businessModel.find({user: user._id})
        user.business = business
    }
    return user
}

findUserByEmail = async (req) => {
    return userModel.findOne({ email: req.body.email})
}

// load relation of users model
getRelations = async (users, relations) => {
    const idsUser = []
    users.forEach(user => {
        idsUser.push(user._id)
    });

    if(relations.includes('business')){
        var business = await businessModel.find().where('user').in(idsUser)
    }
    
    return users.map(user => {
        if(relations.includes('business')){
            const listBusiness = []
            for (let i = business.length - 1; i >= 0; i--) {
                if(user._id.equals(business[i].user)){
                    listBusiness.push(business[i])
                    business.splice(i, 1)
                }
            }
            user.business = listBusiness
        }
    }); 
}

paginate = async (req) => {
    const paginate = {}

    const perPage = parseInt(req.query.per_page) || 20
    const page = parseInt(req.query.page) || 1
    const offset = perPage*page - perPage;

    const userQuery = userModel.find().skip(offset).limit(perPage)
    const totalUserQuery = userModel.countDocuments()

    const loadBusiness = req.query.load_business

    if(req.query.username){
        userQuery.where('username', new RegExp(req.query.username, "i"))
        totalUserQuery.where('username', new RegExp(req.query.username, "i"))
    }
    if(req.query.age){
        userQuery.where('age', req.query.age)    
        totalUserQuery.where('username', new RegExp(req.query.username, "i"))
    }
    if(req.query.address){
        userQuery.where('address', new RegExp(req.query.address, "i"))
        totalUserQuery.where('username', new RegExp(req.query.username, "i"))
    }

    const usersProgess = userQuery.exec()
    const totalProgess = totalUserQuery.exec()

    const users = await usersProgess
    const total = await totalProgess

    const relations = []
    if(loadBusiness === 'true'){
        relations.push('business')
    }

    if(users.length && relations.length){
        await getRelations(users, relations)  
    }

    paginate.users = users
    paginate.total = total
    
    return paginate
}

findUserByIdAndRemove = async (id) => {
    return userModel.findByIdAndRemove(id)
}

createdUser = async (req) => {
    const bcriptPassword = await bcrypt.hash(req.body.password, 10)
    const createdUser = await userModel.create({
        username: req.body.username,
        password: bcriptPassword,
        age: req.body.age,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        active: req.body.active,
        business: req.body.business_id
    })
    return createdUser
}

updatedUser = async (user) => {
    return user.save()
}

// generate token, refesh_token and save refesh_token to user if login success
generateToken = async (user) => {
    const generatedToken = new Promise((resolve, reject) => {
        jwt.sign({ id: user._id, type: 'token' }, process.env.SECRET_KEY, {expiresIn: "10"}, function(err, token){
            if(!err){
                resolve(token)
            }
            reject(err)
        })
    })
    const generatedRefeshToken = new Promise((resolve, reject) => {
        jwt.sign({ id: user._id, type: 'refreshToken' }, process.env.SECRET_KEY, {expiresIn: "30 days"}, function(err, token){
            if(!err){
                resolve(token)
            }
            reject(err)
        })
    })

    const [token, refreshToken] = await Promise.all([generatedToken, generatedRefeshToken])
  
    user.refresh_token = refreshToken
    await user.save()

    return {
        token, refreshToken
    }
}

// get a black list array tokens in redis
getTokenFromRedis = async () => {
    return new Promise((resolve, reject) => {
        client.lrange("tokenDelete", 0, -1, function(error, value){
            if(!error){
                resolve(value)
            }
            reject(error)
        })
    })
}

// add token want to delete to an exist array tokens in redis
setTokenToRedis = async (token) => {
    return new Promise((resolve, reject) => {
        client.lpush("tokenDelete", token , function(error, value){
            if(!error){
                resolve(value)
            }
            reject(error)
        })
    })
}

module.exports = {
    paginate,
    findUserById,
    findUserByEmail,
    findUserByIdAndRemove,
    createdUser,
    updatedUser,
    generateToken,
    getTokenFromRedis,
    setTokenToRedis
}