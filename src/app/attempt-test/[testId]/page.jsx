"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AttemptTest = () => {
  const params = useParams();
  const testId = params.testId;
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/tests/${testId}`);
        setTest(response.data.test);
      } catch (error) {
        console.error('Error fetching test data:', error);
        toast.error('Failed to load test. Please try again.');
      }
    };

    if (testId) {
      fetchTest();
    }
  }, [testId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`http://localhost:5000/api/tests/${testId}/submit`, { answers });
      toast.success('Test submitted successfully!');
      console.log('Test result:', response.data);
      // To navigate after submission, use:
      // window.location.href = '/results';
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Error submitting test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!test) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading test...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Attempt Test: {test.testName}</h1>
          
          <form onSubmit={handleSubmit}>
            {test.questions.map((question, index) => (
              <div key={index} className="mb-8 p-4 border border-gray-200 rounded-lg text-black">
                <p className="text-lg mb-4">
                  <span className="font-medium">{index + 1}.</span> {question.QuestionText}
                </p>
                
                <div className="space-y-2">
                  {['OptionA', 'OptionB', 'OptionC', 'OptionD'].map((option) => (
                    <label 
                      key={option} 
                      className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={() => 
                          setAnswers((prev) => ({ ...prev, [index]: option }))
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700">{question[option]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 py-2 rounded-md text-white font-medium
                ${isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttemptTest;