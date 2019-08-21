const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  console.log('New WebSocket connection')

  socket.on('join', (options, callback) => {
    const { user, error } = addUser({ id: socket.id, ...options })

    if (error) {
      return callback(error);
    }

    socket.join(user.room)

    socket.emit('message', generateMessage('Welcome!'))
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))

    callback();
  })

  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter()

    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed!')
    }

    io.to('1').emit('message', generateMessage(msg))
    callback();
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage(`${user.username} has left`))
    }
  })

  socket.on('sendLocation', (position, callback) => {
    const url = position ? `https://google.com/maps?q=${position.latitude},${position.longitude}` : null
    io.emit('locationMessage', generateLocationMessage(url))

    callback();
  })
})

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('Server running on port ' + port);
})
