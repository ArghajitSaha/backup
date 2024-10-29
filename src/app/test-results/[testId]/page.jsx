"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const TestResults = () => {
  const params = useParams();
  const testId = params.testId;
  const [results, setResults] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [testResponse, resultsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/tests/${testId}`),
          axios.get(`http://localhost:5000/api/tests/${testId}/results`)
        ]);

        // Log the test data
        console.log("Test Data:", testResponse.data);
        console.log("Test Name:", testResponse.data.test.testName);
        console.log("Test Questions:", testResponse.data.test.questions);
        
        // Log the results data
        console.log("Results Data:", resultsResponse.data);
        console.log("Score:", resultsResponse.data.score);
        console.log("Answers:", resultsResponse.data.answers);

        setTest(testResponse.data.test);
        setResults(resultsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        toast.error('Failed to load test results');
        setLoading(false);
      }
    };

    if (testId) fetchResults();
  }, [testId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading results...</p>
      </div>
    );
  }

  if (!test || !results) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-red-500">Failed to load test results</p>
      </div>
    );
  }

  const totalQuestions = test.questions.length;
  const correctAnswers = results.answers.filter((answer, index) => 
    answer.selectedAnswer === test.questions[index].CorrectAnswer
  ).length;

  // Calculate total marks
  const totalMarks = test.questions.reduce((sum, q) => sum + (q.Marks || 0), 0);
  
  // Calculate percentage
  const percentage = ((results.score / totalMarks) * 100).toFixed(2);
  const passingScore = 40;

  // Log calculated values
  console.log("Total Questions:", totalQuestions);
  console.log("Correct Answers:", correctAnswers);
  console.log("Total Marks:", totalMarks);
  console.log("Score Achieved:", results.score);
  console.log("Percentage Calculated:", percentage);
  console.log("Passing Score Threshold:", passingScore);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Test Results: {test.testName}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-3xl font-bold text-blue-600">{results.score}</p>
              <p className="text-sm text-gray-600">out of {totalMarks}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Percentage</p>
              <p className="text-3xl font-bold text-green-600">{percentage}%</p>
              <p className="text-sm text-gray-600">
                {percentage >= passingScore ? 'Passed' : 'Failed'}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Correct Answers</p>
              <p className="text-3xl font-bold text-purple-600">{correctAnswers}</p>
              <p className="text-sm text-gray-600">out of {totalQuestions}</p>
            </div>
          </div>

          <div className="space-y-6 text-black">
            <h2 className="text-xl font-semibold mb-4">Question Review</h2>
            
            {test.questions.map((question, index) => {
              const userAnswer = results.answers[index]?.selectedAnswer;
              const isCorrect = userAnswer === question.CorrectAnswer;

              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-lg flex-1">
                      <span className="font-medium">{index + 1}.</span> {question.QuestionText}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <div 
                        key={option}
                        className={`p-2 rounded ${
                          option === userAnswer
                            ? isCorrect
                              ? 'bg-green-200' // Light green for correct
                              : 'bg-red-200' // Light red for wrong
                            : option === question.CorrectAnswer
                              ? 'bg-green-100' // Light gray for correct option when not selected
                              : 'bg-gray-100'
                        }`}
                      >
                        <span className="font-medium mr-2">{option}:</span>
                        {question[`Option${option}`]}
                      </div>
                    ))}
                  </div>

                  {!isCorrect && (
                    <div className="mt-4 text-sm text-gray-600">
                      <span className="font-medium">Correct Answer:</span> {question[question.CorrectAnswer]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Print Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
