const mongoose = require('mongoose');
const testSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    timeLimit: {
      type: Number,  // in minutes
      default: 60,
    },
    questions: [{
      questionText: {
        type: String,
        required: true,
      },
      options: {
        A: String,
        B: String,
        C: String,
        D: String,
      },
      correctAnswer: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D'],
      },
      marks: {
        type: Number,
        default: 1,
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  });

const Test = mongoose.model('Test', testSchema);
module.exports.Test = Test;