require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connDB = require('./config/DB')
const path = require('path')

const app = express();
const PORT = 5000;

connDB();
//Middlewares
app.use(cors());
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//API Routes
app.use('/api/tests', require('./routes/tests'))
app.get('/', (req, res)=>{
    res.send(`Server is ON on port ${PORT}`);
});
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});