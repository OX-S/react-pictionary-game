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

const words = [
    'apple',
    'house',
    'car',
    'dog',
    'tree',
    // Add more words as needed
];

let rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', (roomId, username) => {
        socket.join(roomId);
        socket.username = username;
        socket.roomId = roomId;

        if (!rooms[roomId]) {
            rooms[roomId] = {
                users: [],
                drawingData: null,
                currentDrawerIndex: 0,
                currentWord: '',
                gameInProgress: false,
                scores: {},
                timer: null,
                timeLeft: 60,
            };
        }

        rooms[roomId].users.push({
            id: socket.id,
            username,
        });

        // Initialize scores
        rooms[roomId].scores[username] = 0;

        io.to(roomId).emit(
            'userList',
            rooms[roomId].users
        );

        // Automatically start game if enough players
        const room = rooms[roomId];
        if (
            room.users.length >= 2 &&
            !room.gameInProgress
        ) {
            room.gameInProgress = true;
            room.currentDrawerIndex = -1;
            startNewRound(roomId);
        }
    });

    socket.on('drawing', (data) => {
        const room = rooms[socket.roomId];
        if (room) {
            room.drawingData = data;
            socket
                .to(socket.roomId)
                .emit('drawing', data);
        }
    });

    socket.on('guess', (text) => {
        const room = rooms[socket.roomId];
        if (!room) return;

        const isCorrect =
            text.toLowerCase() ===
            room.currentWord.toLowerCase();

        const message = {
            username: socket.username,
            text,
            correct: isCorrect,
        };

        io.to(socket.roomId).emit('message', message);

        if (isCorrect) {
            // Update scores
            room.scores[socket.username] += 1;
            io.to(socket.roomId).emit(
                'updateScores',
                room.scores
            );

            // Stop the timer
            clearInterval(room.timer);

            // Start new round after a delay
            setTimeout(() => {
                startNewRound(socket.roomId);
            }, 3000); // 3-second delay
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const room = rooms[socket.roomId];
        if (room) {
            room.users = room.users.filter(
                (user) => user.id !== socket.id
            );
            delete room.scores[socket.username];
            io.to(socket.roomId).emit(
                'userList',
                room.users
            );
            io.to(socket.roomId).emit(
                'updateScores',
                room.scores
            );

            // If room is empty, delete it
            if (room.users.length === 0) {
                delete rooms[socket.roomId];
            }
        }
    });

    function startNewRound(roomId) {
        const room = rooms[roomId];
        if (!room) return;

        room.currentDrawerIndex =
            (room.currentDrawerIndex + 1) %
            room.users.length;
        const drawer =
            room.users[room.currentDrawerIndex];

        room.currentWord =
            words[
                Math.floor(Math.random() * words.length)
                ];

        io.to(drawer.id).emit(
            'wordAssigned',
            room.currentWord
        );
        io.to(roomId).emit('newRound', {
            drawer: drawer.username,
        });

        room.drawingData = null;
        io.to(roomId).emit('clearCanvas');

        // Start round timer
        room.timeLeft = 60; // 60 seconds
        if (room.timer) {
            clearInterval(room.timer);
        }
        room.timer = setInterval(() => {
            room.timeLeft -= 1;
            io.to(roomId).emit(
                'timerUpdate',
                room.timeLeft
            );

            if (room.timeLeft <= 0) {
                clearInterval(room.timer);
                startNewRound(roomId);
            }
        }, 1000);
    }
});

server.listen(4000, () => {
    console.log('Server is running on port 4000');
});
