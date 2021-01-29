require('./config/dbConnect')
require('./config/redisConnect')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var Router = require('./routes/api');
var app = express();
var redisHelper = require('./helpers/Redis')

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

const server = require('http').createServer(app)
var io = require('socket.io')(server, {cors: {origin: '*'}})
let userIds = [];
io.on('connection', (socket) => {
  socket.on('userId', (userId, fn) => {
    if (!userIds.includes(userId)) userIds.push(userId)
    fn(true)
  })

  socket.on('status', () => {
    io.emit('userIds', userIds)
  })

  socket.on('logout', (userId, fn) => {
    var index = userIds.indexOf(userId)
    userIds.splice(index, 1)
    io.emit('userIds', userIds)
    fn(true)
  })

  // DISCONNECT EVENT
  socket.on('disconnect', (reason) => {
    socket.disconnect(); // DISCONNECT SOCKET
  });

});
server.listen(5000)

app.use('/api', Router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
