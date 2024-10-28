// app/attempt-test/[testId]/page.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';

const AttemptTest = () => {
  const router = useRouter();
  const { testId } = router.query; // Extract testId from the URL
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch test data when component mounts or when testId changes
  useEffect(() => {
    if (testId) {
      const fetchTest = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/tests/${testId}`);
          setTest(response.data.test);
        } catch (error) {
          console.error('Error fetching test data:', error);
          toast.error('Failed to load test. Please try again.');
        }
      };
      fetchTest();
    }
  }, [testId]);

  // Handle answer selection
  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: selectedOption,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`http://localhost:5000/api/tests/${testId}/submit`, { answers });
      toast.success('Test submitted successfully!');
      // Navigate to a results page or display score here if you wish
      console.log('Test result:', response.data);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Error submitting test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!test) return <p>Loading test...</p>;

  return (
    <div>
      <h1>Attempt Test: {test.testName}</h1>
      <form onSubmit={handleSubmit}>
        {test.questions.map((question, index) => (
          <div key={index}>
            <p>{index + 1}. {question.QuestionText}</p>
            {['OptionA', 'OptionB', 'OptionC', 'OptionD'].map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={answers[index] === option}
                  onChange={() => handleAnswerChange(index, option)}
                />
                {question[option]}
              </label>
            ))}
          </div>
        ))}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Test'}
        </button>
      </form>
    </div>
  );
};

export default AttemptTest;
