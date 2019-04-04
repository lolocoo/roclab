const path = require('path');

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));



app.get('/', function(req, res){
    res.send('<h1>Hello world</h1>');
});

app.get('/chat', function(req, res){
    res.sendFile(__dirname + '/index.html')
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('chat message', function(msg){
      console.log(msg);
      io.emit('chat message', msg)
    })
    socket.on('disconnect', function(){
      console.log('user disconnectd');
    });
    socket.on('typing', function(){
      console.log('typing...');
      io.emit('typing')
    });
    socket.on('out typing', function(){
      console.log('out typing...');
      io.emit('out typing')
    });
})

http.listen(3000, function(){
    console.log('listening on *:3000');
})
