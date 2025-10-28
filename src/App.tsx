import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import CreateExam from './pages/CreateExam';
import EditExam from './pages/EditExam';
import AttemptExam from './pages/AttemptExam';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateExam />} />
          <Route path="/edit/:examId" element={<EditExam />} />
          <Route path="/attempt/:examId" element={<AttemptExam />} />
          <Route path="/results/:attemptId" element={<Results />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
