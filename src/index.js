const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  console.log('New WebSocket connection')

  socket.on('join', ({ username, room }) => {
    socket.join(room)

    socket.emit('message', generateMessage('Welcome!'))
    socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))
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
    io.emit('message', generateMessage('A user has left'))
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
