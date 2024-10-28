require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connDB = require('./config/DB');
const Test = require('./models/Test');

const app = express();
const PORT = process.env.PORT || 5000;
const TestResult = require('./models/testresult');

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
// app.get('/api/tests/:testId', async (req, res) => {
//     try {
//       const test = await Test.findById(req.params.testId);
//       if (!test) return res.status(404).json({ message: 'Test not found' });
//       res.json({ test });
//     } catch (error) {
//       console.error('Error fetching test:', error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
// Add this route to handle test submission
// app.post('/api/tests/:testId/submit', async (req, res) => {
//     const { answers } = req.body;
  
//     try {
//       const test = await Test.findById(req.params.testId);
//       if (!test) return res.status(404).json({ message: 'Test not found' });
//       console.log(test);
//       let score = 0;
//       test.questions.forEach((question, index) => {
//         if (answers[index] === question.CorrectAnswer) {
//           score += question.Marks;
//         }
//       });
  
//       res.json({ message: 'Test submitted successfully', score });
//     } catch (error) {
//       console.error('Error submitting test:', error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
    
// app.post('/api/tests/:testId/submit', async (req, res) => {
//     const { answers } = req.body;
  
//     try {
//       const test = await Test.findById(req.params.testId);
//       if (!test) return res.status(404).json({ message: 'Test not found' });
      
//       let score = 0;
//       test.questions.forEach((question, index) => {
//         // Ensure both are in the same format for comparison
//         const submittedAnswer = answers[index];
//         const correctAnswer = question.CorrectAnswer.replace('Option', '');
        
//         console.log(`Question ${index}:`, {
//           submitted: submittedAnswer,
//           correct: correctAnswer,
//           isCorrect: submittedAnswer === correctAnswer
//         });
  
//         if (submittedAnswer === correctAnswer) {
//           score += question.Marks;
//         }
//       });
  
//       res.json({ message: 'Test submitted successfully', score });
//     } catch (error) {
//       console.error('Error submitting test:', error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });

// Get test with populated questions
app.get('/api/tests/:testId', async (req, res) => {
    try {
      const test = await Test.findById(req.params.testId)
        .populate({
          path: 'questions',
          select: '-CorrectAnswer' // Exclude correct answers for security
        })
        .select('testName Duration Subject Description totalMarks'); // Select only needed fields
  
      if (!test) {
        return res.status(404).json({ 
          success: false, 
          message: 'Test not found' 
        });
      }
  
      // Calculate total marks
      const totalMarks = test.questions.reduce((sum, question) => sum + question.Marks, 0);
  
      // Format the response
      const formattedTest = {
        test: {
          _id: test._id,
          testName: test.testName,
          Duration: test.Duration,
          Subject: test.Subject,
          Description: test.Description,
          totalMarks,
          questions: test.questions.map(q => ({
            _id: q._id,
            QuestionText: q.QuestionText,
            OptionA: q.OptionA,
            OptionB: q.OptionB,
            OptionC: q.OptionC,
            OptionD: q.OptionD,
            Marks: q.Marks
          }))
        }
      };
  
      res.json(formattedTest);
  
    } catch (error) {
      console.error('Error fetching test:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching test details',
        error: error.message 
      });
    }
  });
// app.post('/api/tests/:testId/submit', async (req, res) => {
//     const { answers } = req.body;
  
//     try {
//       const test = await Test.findById(req.params.testId);
//       if (!test) return res.status(404).json({ message: 'Test not found' });
      
//       let score = 0;
//       test.questions.forEach((question, index) => {
//         // Ensure both are in the same format for comparison
//         const submittedAnswer = answers[index];
//         const correctAnswer = question.CorrectAnswer.replace('Option', '');
        
//         console.log(`Question ${index}:`, {
//           submitted: submittedAnswer,
//           correct: correctAnswer,
//           isCorrect: submittedAnswer === correctAnswer
//         });
  
//         if (submittedAnswer === correctAnswer) {
//           score += question.Marks;
//         }
//       });
  
//       res.json({ message: 'Test submitted successfully', score });
//     } catch (error) {
//       console.error('Error submitting test:', error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });

app.post('/api/tests/:testId/submit', async (req, res) => {
  const { answers } = req.body;
  // const userId = req.user._id; // Assuming you're using authentication to get the user's ID

  try {
    const test = await Test.findById(req.params.testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    let score = 0;
    const correctAnswers = [];

    // Calculate the score and prepare data for saving the result
    test.questions.forEach((question, index) => {
      const submittedAnswer = answers[index];
      const correctAnswer = question.CorrectAnswer.replace('Option', '');

      if (submittedAnswer === correctAnswer) {
        score += question.Marks;
      }

      correctAnswers.push({
        questionId: question._id,
        selectedAnswer: submittedAnswer,
      });
    });

    // Save the attempt in the TestResult collection
    const testResult = new TestResult({
      testId: req.params.testId,
      // userId: userId,
      score: score,
      answers: correctAnswers,
    });

    await testResult.save();

    res.json({
      message: 'Test submitted successfully',
      score: score,
      resultId: testResult._id, // Optional: ID for referencing this attempt
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

  // app.get('/api/tests/:testId/results', async (req, res) => {
  //   try {
  //     const result = await TestResult.findOne({
  //       testId: req.params.testId,
  //       userId: req.user._id // Assuming you have authentication middleware
  //     });
  
  //     if (!result) {
  //       return res.status(404).json({ message: 'Test result not found' });
  //     }
  
  //     res.json({
  //       score: result.score,
  //       answers: result.answers,
  //       correctAnswers: result.correctAnswers,
  //       submittedAt: result.submittedAt
  //     });
  //   } catch (error) {
  //     console.error('Error fetching test results:', error);
  //     res.status(500).json({ message: 'Server error' });
  //   }
  // });
// Root Route

app.get('/api/tests/:testId/results', async (req, res) => {
  // const userId = req.user._id;
  // Assuming you're using authentication to get the user's ID
  try {
    const result = await TestResult.findOne({
      testId: req.params.testId,
      // userId: userId,
    }).populate('testId', 'testName Duration Subject'); // Optionally populate test details

    if (!result) return res.status(404).json({ message: 'Test result not found' });

    res.json({
      test: result.testId,
      score: result.score,
      answers: result.answers,
      submittedAt: result.submittedAt,
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.get('/', (req, res) => {
  res.send(`Server is running on port ${PORT}`);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
