const userModel = require('../models/user');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const moment = require('moment');

findUserById = async (req) => {
    const user = await userModel.findById(req.params.id)
    if(!user){
        return null
    }
    return user
}

paginate = async (req) => {
    const paginate = {}

    const pageSize = parseInt(req.query.page_size) || 10
    const page = parseInt(req.query.page) || 1
    const offset = pageSize*page - pageSize;

    const sortField = req.query.sort_field || 'createdAt'
    const sortBy = req.query.sort_by && req.query.sort_by.toLowerCase() == 'asc' ? 'asc' : 'desc'

    const userQuery = userModel.find().sort({[sortField]: sortBy}).skip(offset).limit(pageSize)
    const totalUserQuery = userModel.countDocuments()

    if(req.query.username){
        userQuery.where('username', new RegExp(req.query.username, "i"))
        totalUserQuery.where('username', new RegExp(req.query.username, "i"))
    }
    if(req.query.email){
        userQuery.where('email', new RegExp(req.query.email, "i"))
        totalUserQuery.where('email', new RegExp(req.query.email, "i"))
    }
    if(req.query.age){
        userQuery.where('age', req.query.age)    
        totalUserQuery.where('age', new RegExp(req.query.age, "i"))
    }
    if(req.query.address){
        userQuery.where('address', new RegExp(req.query.address, "i"))
        totalUserQuery.where('address', new RegExp(req.query.address, "i"))
    }
    if(req.query.phone){
        userQuery.where('phone', new RegExp(req.query.phone, "i"))
        totalUserQuery.where('phone', new RegExp(req.query.phone, "i"))
    }
    if(req.query.created_at){
        const startDay = new moment(req.query.created_at, 'DD-MM-YYYY').startOf('day')
        const endDay = new moment(req.query.created_at, 'DD-MM-YYYY').endOf('day')
        userQuery.where('createdAt').gte(startDay).lte(endDay)
        totalUserQuery.where('createdAt').gte(startDay).lte(endDay)
    }

    const usersProgess = userQuery.exec()
    const totalProgess = totalUserQuery.exec()

    const users = await usersProgess
    const total = await totalProgess

    paginate.users = users
    paginate.total = total
    paginate.page = page
    paginate.pageSize = pageSize
    
    return paginate
}

index = async (req) => {
    const users = await userModel.find().exec()
    return users
}

findUserByIdAndRemove = async (id) => {
    return userModel.findByIdAndRemove(id)
}

createdUser = async (req) => {
    console.log(req.file)
    const password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT))
    const user = new userModel({
        username: req.body.username,
        password: password,
        age: req.body.age,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        gender: req.body.gender,
        birthday: req.body.birthday,
        hobbies: req.body.hobbies,
        avatar: req.file ? req.file.filename : getAvatarByGender(req.body.gender)
    })
    await user.save()
    return userModel.findById(user._id)
}

getAvatarByGender = (gender) => {
    let avatar = 'default_avatar.jpeg'
    if(gender === 'male'){
        avatar = 'default_avatar_male.jpeg'
    }
    if(gender === 'female'){
        avatar = 'default_avatar_female.jpeg'
    }
    return avatar
}

updatedUser = async (req) => {
    const user = req.updatedUser
    if('username' in req.body){
        user.username = req.body.username
    }
    if('password' in req.body){
        user.password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT))
    }
    if('email' in req.body){
        user.email = req.body.email
    }
    if('address' in req.body){
        user.address = req.body.address
    }
    if('phone' in req.body){
        user.phone = req.body.phone
    }
    if('age' in req.body){
        user.age = req.body.age
    }
    if('active' in req.body){
        user.active = req.body.active
    }
    if('gender' in req.body){
        if(req.body.gender === 'male'){
            user.gender = req.body.gender
        }else if(req.body.gender === 'female'){
            user.gender = req.body.gender
        }else{
            user.gender = 'other'
        }  
    }
    if('birthday' in req.body){
        user.birthday = req.body.birthday
    }
    if('hobbies' in req.body){
        user.hobbies = req.body.hobbies
    }
    if(req.file){
        user.avatar = req.file.filename
    }else{
        if(req.body.default_avatar && req.body.gender === 'male'){
            user.avatar = 'default_avatar_male.jpeg'
        }else if(req.body.default_avatar && req.body.gender === 'female'){
            user.avatar = 'default_avatar_female.jpeg'
        }else if(req.body.default_avatar){
            user.avatar = 'default_avatar.jpeg'
        }
    }

    await user.save()
    return userModel.findById(user._id)
}

updateRefreshToken = async (req) => {
    const user = req.updatedUser
    await user.save()
    return userModel.findById(user._id)
}

// Gửi reset_token_password vào mail của user nào quên mật khẩu
sendMail = async (req) => {
    const user = req.user
    // lưu token reset password vào database
    const updatedUser = await user.save()
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: 'binhduck2000@gmail.com',
          pass: 'P@ssword1990'
        }
      });   
      
      const mailOptions = {
        from: 'binhduck2000@gmail.com',
        to: updatedUser.email,
        subject: 'We heard that you lost your password. Sorry about that! But don’t worry! You can use the following link to reset your password:',
        text: `${process.env.REACT_DOMAIN}/reset-password/${updatedUser.reset_password_token}`
      };
      
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error, info){
            if(!error){
                resolve(info)
            }
            reject(error)
          });
      })
}

// Cập nhật lại mật khẩu sau khi reset
resetPassword = async (req) => {
    const user = req.user
    user.password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT))
    user.save()
}

module.exports = {
    index,
    paginate,
    findUserById,
    findUserByIdAndRemove,
    createdUser,
    updatedUser,
    updateRefreshToken,
    sendMail,
    resetPassword,
}