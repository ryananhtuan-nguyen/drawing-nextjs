const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);

import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

type Point = { x: number; y: number };
type DrawLine = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};
io.on('connection', (socket) => {
  socket.on('client-ready', () => {
    socket.broadcast.emit('get-canvas-state');
  });

  socket.on('canvas-state', (state) => {
    socket.broadcast.emit('canvas-state-from-server', state);
  });
  socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLine) => {
    socket.broadcast.emit('draw-line', { prevPoint, currentPoint, color });
  });

  socket.on('user-name', (username: string) => {
    socket.broadcast.emit('new-joined', username);
  });

  socket.on('chosen-word', (word: string) => {
    console.log(word);
    socket.broadcast.emit('current-word', word);
  });

  socket.on('winner', (name: string) => {
    io.emit('game-over', name);
  });
  socket.on('next-turn', () => {
    socket.broadcast.emit('next-turn');
  });
  socket.on('clear', () => io.emit('clear'));
  socket.on('new-score', (newScore: number) => {
    socket.broadcast.emit('op-score', newScore);
  });
});

server.listen(3001, () => {
  console.log('server listening on port 3001');
});
