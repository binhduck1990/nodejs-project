const userModel = require('../models/user')
const { check, validationResult } = require('express-validator');
const ObjectID = require("mongodb").ObjectID

create = async (req, res, next) => {
  try {
    const validations = [
      check('username')
        .isLength({ min: 1 }).withMessage('username min 1 characters').bail()
        .isLength({ max: 50 }).withMessage('username max 50 characters'),
      check('password')
        .isLength({ min: 8 }).withMessage('password min 8 characters').bail()
        .isLength({ max: 50 }).withMessage('password max 50 characters'),
      check('phone')
        .isLength({ min: 10 }).withMessage('phone min 10 characters').bail()
        .isLength({ max: 50 }).withMessage('phone max 50 characters'),
      check('email')
        .notEmpty().withMessage('email required').bail()
        .isEmail().withMessage('email invalid').bail()
        .isLength({ max: 50 }).withMessage('email max 50 characters').bail()
        .custom(value => {
            return userModel.findOne({email: value}).then(user => {
              if (user) {
                return Promise.reject('Email already in use')
              }
            });
          }),
      check('address')
        .isLength({ max: 50 }).withMessage('address max 50 characters'),
      check('age')
        .isNumeric().withMessage('age must be a number')
  ]
  
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next()
    }
    return res.status(400).json({ message: errors.array() })
  } catch (error) {
    return res.status(404).json({ message: error.message })
  }
}

update = async (req, res, next) => {
  try {
    const validations = [
      check('username')
        .if(check('username').exists())
        .isLength({ min: 1 }).withMessage('username min 1 characters').bail()
        .isLength({ max: 50 }).withMessage('username max 50 characters'),
      check('password')
        .if(check('password').exists())
        .isLength({ min: 8 }).withMessage('password min 8 characters').bail()
        .isLength({ max: 50 }).withMessage('password max 50 characters'),
      check('phone')
        .if(check('phone').exists())
        .isLength({ min: 10 }).withMessage('phone min 10 characters').bail()
        .isLength({ max: 50 }).withMessage('phone max 50 characters'),
      check('email')
        .if(check('email').exists())
        .not().isEmpty().withMessage('email required').bail()
        .isEmail().withMessage('email invalid').bail()
        .isLength({ max: 50 }).withMessage('email max 50 characters').bail()
        .custom(value => {
            return userModel.findOne({email: value, _id: {$ne: req.params.id}}).then(user => {
              if (user) {
                return Promise.reject('Email already in use')
              }
            });
          }),
      check('address')
        .if(check('address').exists())
        .isLength({ max: 50 }).withMessage('address max 50 characters'),
      check('age')
        .if(check('age').exists())
        .isNumeric().withMessage('age must be a number'),
      check('active')
        .if(check('active').exists())
        .isBoolean().withMessage('active must be a boolean')
    ]

    await Promise.all(validations.map(validation => validation.run(req)))
    const errors = validationResult(req)
    // validate form dữ liệu khi sửa user
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() })
    }

    // validate nếu user không tồn tại
    if(!ObjectID.isValid(req.params.id)){
      return res.status(400).json({ message: 'user not found' })
    }

    const user = await userModel.findById(req.params.id)
    if(!user){
      return res.status(400).json({ message: 'user not found' })
    }
    
    req.updatedUser = user
    return next()
  } catch (error) {
    return res.status(404).json({ message: error.message })
  }
}

module.exports = {
  create,
  update
}