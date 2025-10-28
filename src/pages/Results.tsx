import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ClockIcon, ChartBarIcon, EyeIcon } from '@heroicons/react/24/outline';
import ResultsSummary from '../components/ResultsSummary';
import QuestionReview from '../components/QuestionReview';
import PreviousAttempts from '../components/PreviousAttempts';
import { attemptService, examService, questionService } from '../lib/api';
import { Attempt } from '../types/attempt.types';
import { Exam } from '../types/exam.types';
import { Question } from '../types/question.types';

const Results: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [previousAttempts, setPreviousAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (attemptId) {
      loadResultsData();
    }
  }, [attemptId]);

  const loadResultsData = async () => {
    if (!attemptId) return;
    
    try {
      setLoading(true);
      
      // Load attempt data
      const attemptData = await attemptService.getAttempt(attemptId);
      setAttempt(attemptData);
      
      // Load exam and questions
      const [examData, questionsData] = await Promise.all([
        examService.getExam(attemptData.exam_id),
        questionService.getQuestionsByExam(attemptData.exam_id)
      ]);
      
      setExam(examData);
      setQuestions(questionsData);
      
      // Load previous attempts
      const previousAttemptsData = await attemptService.getAttemptsByExam(attemptData.exam_id);
      setPreviousAttempts(previousAttemptsData.filter(a => a.id !== attemptId));
      
    } catch (error) {
      console.error('Failed to load results:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Satisfactory';
    if (percentage >= 60) return 'Pass';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!attempt || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Results not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  const percentage = Math.round((attempt.total_marks / attempt.max_marks) * 100);
  const gradeColor = getGradeColor(percentage);
  const gradeLabel = getGradeLabel(percentage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
                <p className="text-gray-600 mt-1">{exam.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/attempt/${exam.id}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Retake Exam
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        <div className="mb-8">
          <ResultsSummary
            attempt={attempt}
            exam={exam}
            percentage={percentage}
            gradeColor={gradeColor}
            gradeLabel={gradeLabel}
            timeTaken={formatTime(attempt.time_taken)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Review */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Question Review</h2>
                <p className="text-gray-600 mt-1">Review your answers and feedback</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {questions.map((question, index) => {
                    const studentAnswer = attempt.answers[question.id];
                    const aiFeedback = attempt.ai_feedback.find(f => f.question_id === question.id);
                    
                    return (
                      <QuestionReview
                        key={question.id}
                        question={question}
                        questionNumber={index + 1}
                        studentAnswer={studentAnswer}
                        aiFeedback={aiFeedback}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Previous Attempts */}
          <div className="lg:col-span-1">
            <PreviousAttempts
              attempts={previousAttempts}
              currentAttemptId={attempt.id}
              onAttemptSelect={(attemptId) => navigate(`/results/${attemptId}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
