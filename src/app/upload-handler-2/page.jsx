// page.js
'use client'
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const CreateTestPage = () => {
  const [testName, setTestName] = useState('');
  const [numberOfAttempts, setNumberOfAttempts] = useState(1);
  const [questionRandomization, setQuestionRandomization] = useState(false);
  const [testAccessPeriod, setTestAccessPeriod] = useState('');
  const [questions, setQuestions] = useState([]);

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
        toast.success('Questions loaded successfully!');
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Please upload a valid Excel file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testName || questions.length === 0) {
      toast.error('Please provide a test name and upload questions.');
      return;
    }
    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testName, numberOfAttempts, questionRandomization, testAccessPeriod, questions }),
      });
      if (response.ok) {
        toast.success('Test created successfully!');
      } else {
        toast.error('Error creating test. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error connecting to server.');
    }
  };

  const handleQuestionChange = (index, key, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][key] = value;
    setQuestions(updatedQuestions);
  };

  const handleAddRow = (index) => {
    const newQuestion = { QuestionText: '', OptionA: '', OptionB: '', OptionC: '', OptionD: '', CorrectAnswer: '', Marks: '' };
    const updatedQuestions = [...questions.slice(0, index + 1), newQuestion, ...questions.slice(index + 1)];
    setQuestions(updatedQuestions);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedQuestions = Array.from(questions);
    const [removed] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, removed);
    setQuestions(reorderedQuestions);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 p-10 font-poppins">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mb-6">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-6">Create a New Test</h2>
        <label className="block text-gray-700 text-lg font-semibold mb-2">Test Name</label>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          required
          placeholder="Enter Test Name"
          className="w-full p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex items-center justify-between mt-4 mb-4">
          <label className="block text-gray-700 text-lg font-semibold">Number of Attempts</label>
          <input
            type="number"
            value={numberOfAttempts}
            onChange={(e) => setNumberOfAttempts(e.target.value)}
            required
            min={1}
            className="w-1/4 p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between mt-4 mb-4">
          <label className="block text-gray-700 text-lg font-semibold">Question Randomization</label>
          <input
            type="checkbox"
            checked={questionRandomization}
            onChange={(e) => setQuestionRandomization(e.target.checked)}
            className="w-1/4 p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between mt-4 mb-4">
          <label className="block text-gray-700 text-lg font-semibold">Test Access Period</label>
          <input
            type="text"
            value={testAccessPeriod}
            onChange={(e) => setTestAccessPeriod(e.target.value)}
            required
            placeholder="Enter (in hours)"
            className="w-1/4 p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className='flex justify-center'>
          <button
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSubmit}
          >
            Create Test
          </button>
        </div>

        <ToastContainer />
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mb-6">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-6">Upload Questions</h2>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".xlsx"
          className="w-full p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {questions.map((question, index) => (
                  <Draggable key={index} draggableId={String(index)} index={index}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        className="bg-white p-4 rounded-lg shadow-md mb-4"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-700 text-lg font-semibold">Question {index + 1}</span>
                          <button
                            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleAddRow(index)}
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="text"
                          value={question.QuestionText}
                          onChange={(e) => handleQuestionChange(index, 'QuestionText', e.target.value)}
                          required
                          placeholder="Enter Question"
                          className="w-full p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex flex-wrap mb-4">
                          <div className="w-1/2 pr-2">
                            <label className="block text-gray-700 text-lg font-semibold">Option A</label>
                            <input
                              type="text"
                              value={question.OptionA}
                              onChange={(e) => handleQuestionChange(index, 'OptionA', e.target.value)}
                              required
                              placeholder="Enter Option A"
                              className="w-full p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="w-1/2 pl-2">
                            <label className="block text-gray-700 text-lg font-semibold">Option B</label>
                            <input
                              type="text"
                              value={question.OptionB}
                              onChange={(e) => handleQuestionChange(index, 'OptionB', e.target.value)}
                              required
                              placeholder="Enter Option B"
                              className="w-full p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap mb-4">
                          <div className="w-1/2 pr-2">
                            <label className="block text-gray-700 text-lg font-semibold">Option C</label>
                            <input
                              type="text"
                              value={question.OptionC}
                              onChange={(e) => handleQuestionChange(index, 'OptionC', e.target.value)}
                              required
                              placeholder="Enter Option C"
                              className="w-full p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="w-1/2 pl-2">
                            <label className="block text-gray-700 text-lg font-semibold">Option D</label>
                            <input
                              type="text"
                              value={question.OptionD}
                              onChange={(e) => handleQuestionChange(index, 'OptionD', e.target.value)}
                              required
                              placeholder="Enter Option D"
                              className="w-full p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap mb-4">
                          <div className="w-1/2 pr-2">
                            <label className="block text-gray-700 text-lg font-semibold">Correct Answer</label>
                            <input
                              type="text"
                              value={question.CorrectAnswer}
                              onChange={(e) => handleQuestionChange(index, 'CorrectAnswer', e.target.value)}
                              required
                              placeholder="Enter Correct Answer"
                              className="w-full p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="w-1/2 pl-2">
                            <label className="block text-gray-700 text-lg font-semibold">Marks</label>
                            <input
                              type="number"
                              value={question.Marks}
                              onChange={(e) => handleQuestionChange(index, 'Marks', e.target.value)}
                              required
                              min={1}
                              className="w-full p-3 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default CreateTestPage;