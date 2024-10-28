const mongoose = require('mongoose');

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

module.exports = mongoose.model('Test', TestSchema);
