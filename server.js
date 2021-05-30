const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const rooms = { }

app.get('/', function(req, res){
  res.render('index', { rooms: rooms })
})

app.post('/room', function(req, res) {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  res.redirect(req.body.room)
  // Send message that new room was created
  io.emit('room-created', req.body.room)
})

app.get('/:room', function(req, res) {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })
})

server.listen(3000,function(req,res){
  console.log("server is up at 3000");
})

io.on('connection', function(socket) {
  socket.on('new-user', function(room, name){
    socket.join(room)
    rooms[room].users[socket.id] = name
    socket.to(room).broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', function(room, message)  {
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })

})
