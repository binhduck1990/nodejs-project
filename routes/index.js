var express = require('express');
var Router = express.Router();
const UserController = require('../controllers/UserController')

Router.post('/login', UserController.login)
Router.get('/user', UserController.paginate)
Router.get('/user/:id', UserController.show)
Router.delete('/user/:id', UserController.destroy)
Router.post('/user/', UserController.create)
Router.patch('/user/:id', UserController.update)

module.exports = Router;
