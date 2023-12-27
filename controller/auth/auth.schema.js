const { body } = require('express-validator')

const userValidationRules = () => {
  return [
    body('name')
      .trim()
      .escape()
      .not()
      .isEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ min: 1 })
      .withMessage('Name must be at least 1 chars long'),

    body('email')
      .trim()
      .escape()
      .not()
      .isEmpty()
      .withMessage('Email cannot be empty')
      .isEmail()
      .withMessage('Please enter a valid email address'),

    body('password').isLength({ min: 8 }).withMessage("Password must be at least 8 chars long"),
    // body('mobile').isNumeric().withMessage("Please enter numerical number only").isLength({min:10}).withMessage("Please enter valid mobile number")
  ]
}

const loginValidationRules = () => {
  return [
    body('email')
      .trim()
      .escape()
      .not()
      .isEmpty()
      .withMessage('Email cannot be empty')
      .isEmail()
      .withMessage('Please enter a valid email address'),

    body('password')
      .isLength({ min: 8 })
      .withMessage("Password must should have 8 chars long")

  ]
}

const passwordValidationRules = () => {
  return [
    body('password')
      .isLength({ min: 8 })
      .withMessage("Password must should have 8 chars long")
  ]
}


const nameValidationRules = () => {
  return [
    body('name')
      .trim()
      .escape()
      .not()
      .isEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ min: 5 })
      .withMessage('Name must be at least 5 chars long'),
  ]
}



module.exports = {
  userValidationRules,
  loginValidationRules,
  passwordValidationRules,
  nameValidationRules
}