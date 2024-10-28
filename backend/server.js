require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connDB = require('./config/DB');
const Test = require('./models/Test');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/tests', async (req, res) => {
    try {
      const newTest = new Test(req.body);
      const savedTest = await newTest.save();
      
      // Assuming a frontend route like `/attempt-test/:id`
      const testLink = `http://localhost:3000/attempt-test/${savedTest._id}`;
      
      res.status(201).json({ message: 'Test created successfully', test: savedTest, link: testLink });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating test', error });
    }
  });
  
// Add this to your Express server routes
app.get('/api/tests/:testId', async (req, res) => {
    try {
      const test = await Test.findById(req.params.testId);
      if (!test) return res.status(404).json({ message: 'Test not found' });
      res.json({ test });
    } catch (error) {
      console.error('Error fetching test:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
// Add this route to handle test submission
app.post('/api/tests/:testId/submit', async (req, res) => {
    const { answers } = req.body;
  
    try {
      const test = await Test.findById(req.params.testId);
      if (!test) return res.status(404).json({ message: 'Test not found' });
  
      let score = 0;
      test.questions.forEach((question, index) => {
        if (answers[index] === question.CorrectAnswer) {
          score += question.Marks;
        }
      });
  
      res.json({ message: 'Test submitted successfully', score });
    } catch (error) {
      console.error('Error submitting test:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
    
// Root Route
app.get('/', (req, res) => {
  res.send(`Server is running on port ${PORT}`);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
