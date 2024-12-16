import express from 'express';
import logger from 'morgan';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createClient } from 'redis';

const port = process.env.PORT ?? 3000;
const app = express();

const server = createServer(app);
const io = new Server(server);

const redisClient = createClient();
await redisClient.connect();

io.on('connection', (socket) => {
  console.log('A user connected!');

  // Emit stored messages from Redis
  redisClient.lRange('chat_messages', 0, -1).then((messages) => {
    messages.forEach((message) => {
      const { username, msg } = JSON.parse(message);
      socket.emit('chat message', msg, username);
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('chat message', async (msg) => {
    const username = socket.handshake.auth.username;
    const message = JSON.stringify({ username, msg });
    
    // Store message in Redis
    await redisClient.rPush('chat_messages', message);

    // Emit message to all connected clients
    io.emit('chat message', msg, username);
  });
});

app.use(logger('dev'));
app.use(express.static('client'));
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html');
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
