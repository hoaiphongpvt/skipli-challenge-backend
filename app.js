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

app.use('/students', route.studentRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});