var express = require('express');
var Router = express.Router();
const UserController = require('../controllers/UserController')
const BusinessController = require('../controllers/BusinessController')

Router.post('/user/login', UserController.login)
Router.get('/user', UserController.paginate)
Router.get('/user/:id', UserController.show)
Router.delete('/user/:id', UserController.destroy)
Router.post('/user/', UserController.create)
Router.put('/user/:id', UserController.update)

Router.get('/business', BusinessController.paginate)
Router.get('/business/:id', BusinessController.show)
Router.post('/business', BusinessController.create)
Router.put('/business/:id', BusinessController.update)

module.exports = Router;
