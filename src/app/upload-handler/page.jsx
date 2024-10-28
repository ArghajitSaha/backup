'use client'
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const CreateTestPage = () => {
  const [testName, setTestName] = useState('');
  const [excelFile, setExcelFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [feedback, setFeedback] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: ['QuestionText', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectAnswer', 'Marks'] });
        setQuestions(jsonData.slice(1)); // skip header row
      };
      reader.readAsArrayBuffer(file);
      setFeedback('');
    } else {
      setFeedback('Please upload a valid Excel file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testName || questions.length === 0) {
      setFeedback('Please provide a test name and upload questions.');
      return;
    }
    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testName, questions }),
      });
      if (response.ok) {
        setFeedback('Test created successfully!');
      } else {
        setFeedback('Error creating test. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setFeedback('Error connecting to server.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 p-10 font-poppins">
      <h2 className="text-4xl font-bold text-gray-800 text-center mb-6">Create a New Test</h2>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <label className="block text-gray-700 text-lg font-semibold mb-2">Test Name</label>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          required
          placeholder="Enter Test Name"
          className="w-full p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        
        <label className="block text-gray-700 text-lg font-semibold mt-6 mb-2">Upload Questions (Excel)</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="w-full p-3 bg-gray-200 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
        />

        <button
          type="submit"
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-300"
        >
          Create Test
        </button>
        {feedback && <p className="mt-4 text-center text-indigo-700 font-medium">{feedback}</p>}
      </form>

      {questions.length > 0 && (
        <div className="mt-10 max-w-full overflow-x-auto">
          <h3 className="text-3xl font-semibold text-gray-800 mb-4 text-center">Preview Questions</h3>
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-4 text-left font-semibold">Question Text</th>
                <th className="p-4 text-left font-semibold">Option A</th>
                <th className="p-4 text-left font-semibold">Option B</th>
                <th className="p-4 text-left font-semibold">Option C</th>
                <th className="p-4 text-left font-semibold">Option D</th>
                <th className="p-4 text-left font-semibold">Correct Answer</th>
                <th className="p-4 text-left font-semibold">Marks</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => (
                <tr key={index} className="even:bg-gray-100">
                  <td className="p-4 text-gray-800">{q.QuestionText}</td>
                  <td className="p-4 text-gray-800">{q.OptionA}</td>
                  <td className="p-4 text-gray-800">{q.OptionB}</td>
                  <td className="p-4 text-gray-800">{q.OptionC}</td>
                  <td className="p-4 text-gray-800">{q.OptionD}</td>
                  <td className="p-4 text-gray-800 font-semibold">{q.CorrectAnswer}</td>
                  <td className="p-4 text-gray-800">{q.Marks || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CreateTestPage;
