const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const server = http.createServer(app);
var cookieParser = require('cookie-parser');

const db = require('./src/config/firebase');
const route = require('./src/routes/index');

app.use(
    cors({
        origin: 'http://localhost:3001',
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/auth', route.authRoutes);
app.use('/api/students', route.studentRoutes);
app.use('/api/lessons', route.lessonRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
