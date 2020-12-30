const userModel = require('../models/user')
const { body, validationResult } = require('express-validator');

validate = async (req, res, next) => {
    // validate dữ liệu bằng express-validator
    const validations = [
        body('username')
        .not().isEmpty().withMessage('username required').bail()
        .isLength({ min: 1 }).withMessage('username min 1 characters').bail()
        .isLength({ max: 50 }).withMessage('username max 50 characters'),

        body('password')
        .not().isEmpty().withMessage('password required').bail()
        .isLength({ min: 8 }).withMessage('password min 8 characters').bail()
        .isLength({ max: 50 }).withMessage('password max 50 characters'),

        body('email')
        .not().isEmpty().withMessage('email required').bail()
        .isEmail().withMessage('email invalid').bail()
        .isLength({ max: 50 }).withMessage('email max 50 characters').bail()
        .custom(value => {
            return userModel.findOne({email: value}).then(user => {
              if (user) {
                return Promise.reject('Email already in use');
              }
            });
          }),

        body('address')
        .isLength({ max: 50 }).withMessage('address max 50 characters')
    ]

    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(400).json({ errors: errors.array() });
}

module.exports = {
    validate
}