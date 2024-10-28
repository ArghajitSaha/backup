import mongoose from 'mongoose';

// Connect to MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/excelitest', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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
export default async function handler(request, response) {
  await connectToDatabase();

  if (request.method === 'POST') {
    try {
      // Create a new test document with data from the request body
      const newTest = new Test(request.body);

      // Save the document to MongoDB
      const savedTest = await newTest.save();

      // Send a response with the saved document
      response.status(201).json({ message: 'Test created successfully', test: savedTest });
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: 'Error creating test', error });
    }
  } else {
    // Method not allowed
    response.setHeader('Allow', ['POST']);
    response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}
