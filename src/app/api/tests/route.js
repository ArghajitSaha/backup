import mongoose from 'mongoose';
// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/excelitest');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
// Define a Mongoose schema for tests
const TestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  numberOfAttempts: { type: Number, required: true },
  questionRandomization: { type: Boolean, default: false },
  testAccessPeriod: { type: String, required: true },
  questions: [
    {
      QuestionText: { type: String, required: true },
      OptionA: { type: String, required: true },
      OptionB: { type: String, required: true },
      OptionC: { type: String, required: true },
      OptionD: { type: String, required: true },
      CorrectAnswer: { type: String, required: true },
      Marks: { type: Number, required: true },
    },
  ],
});

// Create Mongoose model (only if it doesn't exist already)
const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);

// API Handler
export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'POST') {
    try {
      // Create a new test document with data from the req body
      const newTest = new Test(req.body);

      // Save the document to MongoDB
      const savedTest = await newTest.save();

      // Send a res with the saved document
      res.status(201).json({ message: 'Test created successfully', test: savedTest });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating test', error });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
