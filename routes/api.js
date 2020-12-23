var express = require('express');
var Router = express.Router();
const UserController = require('../controllers/UserController')
const BusinessController = require('../controllers/BusinessController')
const AuthToken = require('../middleware/AuthToken')
const Role = require('../middleware/Role')

Router.post('/user/login', UserController.login)
Router.post('/user/logout', UserController.logout)
Router.post('/user/', UserController.create)
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
