var express = require('express');
var Router = express.Router();
// Controller
const UserController = require('../controllers/UserController')
const BusinessController = require('../controllers/BusinessController')
// MiddleWare
const AuthToken = require('../middleware/AuthToken')
const Role = require('../middleware/Role')
// Validate
const ResetPasswordValidator = require('../validators/ResetPasswordValidator')
const SendMailValidator = require('../validators/SendMailValidator')
const LoginValidator = require('../validators/LoginValidator')
const LogoutValidator = require('../validators/LogoutValidator')

Router.post('/user', UserController.create)
Router.post('/user/login', LoginValidator.validate, UserController.login)
Router.post('/user/logout', LogoutValidator.validate, UserController.logout)
Router.post('/user/reset-password', SendMailValidator.validate, UserController.sendMail)
Router.put('/user/reset-password/:token', ResetPasswordValidator.validate, UserController.resetPassword)
Router.use(AuthToken.checkToken)

Router.get('/user', UserController.paginate)
Router.get('/user/:id', Role.canManageUser, UserController.show)
Router.delete('/user/:id', Role.canManageUser, UserController.destroy)
Router.put('/user/:id', Role.canManageUser, UserController.update)

Router.get('/business', BusinessController.paginate)
Router.get('/business/:id', BusinessController.show)
Router.post('/business', BusinessController.create)
Router.put('/business/:id', BusinessController.update)

module.exports = Router;
