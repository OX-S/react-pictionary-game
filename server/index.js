const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

let rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle chat messages
    socket.on('message', (text) => {
        const message = {
            username: socket.username,
            text,
        };
        io.to(socket.roomId).emit('message', message);
    });

    // Handle joining a room
    socket.on('joinRoom', (roomId, username) => {
        socket.join(roomId);
        socket.username = username;
        socket.roomId = roomId;

        if (!rooms[roomId]) {
            rooms[roomId] = {
                users: [],
                drawingData: null,
            };
        }

        rooms[roomId].users.push({ id: socket.id, username });
        io.to(roomId).emit('userList', rooms[roomId].users);
    });

    // Handle drawing data
    socket.on('drawing', (data) => {
        rooms[socket.roomId].drawingData = data;
        socket.to(socket.roomId).emit('drawing', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (rooms[socket.roomId]) {
            rooms[socket.roomId].users = rooms[socket.roomId].users.filter(
                (user) => user.id !== socket.id
            );
            io.to(socket.roomId).emit('userList', rooms[socket.roomId].users);
        }
    });
});

server.listen(4000, () => {
    console.log('Server is running on port 4000');
});
