var express = require('express');
var Router = express.Router();

// Controller
const UserController = require('../controllers/UserController')
const BusinessController = require('../controllers/BusinessController')
// MiddleWare
const AuthToken = require('../middleware/AuthToken')
const RoleMiddleware = require('../middleware/Role')
const MulterMiddleware = require('../middleware/Multer')
// Validate
const ResetPasswordValidator = require('../validators/ResetPasswordValidator')
const SendMailValidator = require('../validators/SendMailValidator')
const LoginValidator = require('../validators/LoginValidator')
const LogoutValidator = require('../validators/LogoutValidator')
const RefreshTokenValidator = require('../validators/RefreshTokenValidator')
const UserValidator = require('../validators/UserValidator')

Router.post('/user', MulterMiddleware.uploadAvatar, UserValidator.create, UserController.create)
Router.post('/user/login', LoginValidator.login, UserController.login)
Router.post('/user/logout', LogoutValidator.logout, UserController.logout)
Router.post('/user/refresh-token', RefreshTokenValidator.refresh, UserController.refresh)
Router.post('/user/reset-password', SendMailValidator.sendMail, UserController.sendMail)
Router.put('/user/reset-password/:token', ResetPasswordValidator.resetPassword, UserController.resetPassword)
Router.use(AuthToken.checkToken)

Router.get('/user', UserController.paginate)
Router.get('/user/:id', RoleMiddleware.canManageUser, UserController.show)
Router.delete('/user/:id', RoleMiddleware.canManageUser, UserController.destroy)
Router.put('/user/:id', RoleMiddleware.canManageUser, MulterMiddleware.uploadAvatar, UserValidator.update, UserController.update)

Router.get('/business', BusinessController.paginate)
Router.get('/business/:id', BusinessController.show)
Router.post('/business', BusinessController.create)
Router.put('/business/:id', BusinessController.update)

module.exports = Router;
