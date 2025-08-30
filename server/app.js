const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(express.static(path.join(__dirname, 'public')));
const users = {};
io.on('connection', (socket) => {
  console.log('新用户连接');

  socket.on('login', (username) => {
    users[socket.id] = username;
    socket.emit('systemMessage', `欢迎 ${username} 加入聊天室！`);
    socket.broadcast.emit('systemMessage', `${username} 加入了聊天室`);
    io.emit('userList', Object.values(users));
  });

  socket.on('chatMessage', (message) => {
    const username = users[socket.id] || '匿名用户';
    io.emit('message', {
      username,
      text: message,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      console.log(`${username} 断开连接`);
      delete users[socket.id];
      socket.broadcast.emit('systemMessage', `${username} 离开了聊天室`);
      io.emit('userList', Object.values(users));
    }
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
