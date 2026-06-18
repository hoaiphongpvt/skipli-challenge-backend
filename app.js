const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./src/config/firebase');
const route = require('./src/routes/index');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/auth', route.authRoutes);
app.use('/api/students', route.studentRoutes);
app.use('/api/lessons', route.lessonRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
