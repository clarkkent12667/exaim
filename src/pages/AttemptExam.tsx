import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import ExamHeader from '../components/ExamHeader';
import ProgressTracker from '../components/ProgressTracker';
import QuestionRenderer from '../components/QuestionRenderer';
import { useExamStore } from '../store/examStore';
import { examService, questionService, attemptService, aiService } from '../lib/api';
import { Exam } from '../types/exam.types';
import { Question } from '../types/question.types';
import { ExamAnswer, AIFeedback } from '../types/attempt.types';
import { calculateTotalMarks, calculateMaxMarks, gradeMCQ, gradeFIB } from '../lib/grading';

const AttemptExam: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { currentAttempt, startAttempt, updateAnswer, getAnswer, clearAttempt, saveToLocalStorage, loadFromLocalStorage } = useExamStore();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [evaluatedQuestions, setEvaluatedQuestions] = useState<Set<string>>(new Set());
  const [questionEvaluations, setQuestionEvaluations] = useState<Record<string, any>>({});
  const [submittingQuestion, setSubmittingQuestion] = useState<string | null>(null);
  const [showPendingQuestions, setShowPendingQuestions] = useState(false);

  useEffect(() => {
    if (examId) {
      loadExamData();
      loadFromLocalStorage();
    }
    
    return () => {
      if (currentAttempt) {
        saveToLocalStorage();
      }
    };
  }, [examId]);

  useEffect(() => {
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      if (currentAttempt) {
        saveToLocalStorage();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentAttempt, saveToLocalStorage]);

  useEffect(() => {
    // Timer logic
    if (exam?.settings?.timer_enabled && exam.settings.timer_minutes && timeRemaining !== null) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [exam, timeRemaining]);

  const loadExamData = async () => {
    if (!examId) return;
    
    try {
      setLoading(true);
      
      const [examData, questionsData] = await Promise.all([
        examService.getExam(examId),
        questionService.getQuestionsByExam(examId)
      ]);
      
      setExam(examData);
      setQuestions(questionsData);
      
      // Initialize attempt if not already started
      if (!currentAttempt || currentAttempt.examId !== examId) {
        startAttempt(examId);
      }
      
      // Initialize timer
      if (examData.settings?.timer_enabled && examData.settings.timer_minutes) {
        setTimeRemaining(examData.settings.timer_minutes * 60);
      }
      
    } catch (error) {
      console.error('Failed to load exam:', error);
      toast.error('Failed to load exam');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: ExamAnswer) => {
    updateAnswer(questionId, answer);
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!currentAttempt) return;
    
    setSubmittingQuestion(questionId);
    try {
      const question = questions.find(q => q.id === questionId);
      const answer = getAnswer(questionId);
      
      if (!question || !answer) return;

      let evaluationResult: any = {};

      if (question.type === 'mcq') {
        const mcqResult = gradeMCQ(answer.answer, question.correct_answer, question.options || []);
        evaluationResult = {
          status: mcqResult.isCorrect ? 'Correct' : 'Incorrect',
          marksAwarded: mcqResult.isCorrect ? question.marks : 0,
          feedback: mcqResult.feedback,
          correctAnswer: mcqResult.correctAnswer,
          correctOptionText: mcqResult.correctOptionText
        };
      } else if (question.type === 'fib') {
        const fibResult = gradeFIB(answer.answer, question.correct_answer);
        evaluationResult = {
          status: fibResult.isCorrect ? 'Correct' : 'Incorrect',
          marksAwarded: fibResult.isCorrect ? question.marks : 0,
          feedback: fibResult.feedback,
          correctAnswer: fibResult.correctAnswer
        };
      } else if (question.type === 'open') {
        // Use AI grading for open-ended questions
        const gradingResult = await aiService.gradeOpenEnded({
          studentAnswer: answer.answer,
          modelAnswer: question.model_answer || '',
          marks: question.marks
        });
        
        evaluationResult = {
          status: gradingResult.status,
          marksAwarded: gradingResult.marksAwarded,
          feedback: gradingResult.howToImprove
        };
      }

      // Store evaluation result
      setQuestionEvaluations(prev => ({
        ...prev,
        [questionId]: evaluationResult
      }));
      
      // Mark question as evaluated
      setEvaluatedQuestions(prev => new Set([...prev, questionId]));
      
      toast.success('Answer evaluated successfully!');
      
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
      toast.error('Failed to evaluate answer. Please try again.');
    } finally {
      setSubmittingQuestion(null);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSaveForLater = () => {
    saveToLocalStorage();
    toast.success('Progress saved! You can continue later.');
  };

  const handleAutoSubmit = async () => {
    if (!currentAttempt) return;
    
    toast('Time\'s up! Submitting your exam...', { duration: 3000 });
    await submitExam();
  };

  const submitExam = async () => {
    if (!currentAttempt || !exam) return;
    
    setSubmitting(true);
    try {
      // Calculate auto-graded marks
      let totalMarks = 0;
      const aiFeedback: AIFeedback[] = [];
      
      // Grade MCQ and FIB questions
      questions.forEach(question => {
        const answer = getAnswer(question.id);
        if (!answer) return;
        
        switch (question.type) {
          case 'mcq':
            if (gradeMCQ(answer.answer, question.correct_answer, question.options || []).isCorrect) {
              totalMarks += question.marks;
            }
            break;
          case 'fib':
            if (gradeFIB(answer.answer, question.correct_answer).isCorrect) {
              totalMarks += question.marks;
            }
            break;
          case 'open':
            // Open-ended questions will be graded by AI
            break;
        }
      });
      
      // Grade open-ended questions with AI
      const openEndedQuestions = questions.filter(q => q.type === 'open');
      for (const question of openEndedQuestions) {
        const answer = getAnswer(question.id);
        if (answer && question.model_answer) {
          try {
            const gradingResult = await aiService.gradeOpenEnded({
              studentAnswer: answer.answer,
              modelAnswer: question.model_answer,
              marks: question.marks
            });
            
            totalMarks += gradingResult.marksAwarded;
            aiFeedback.push({
              question_id: question.id,
              status: gradingResult.status,
              howToImprove: gradingResult.howToImprove,
              marksAwarded: gradingResult.marksAwarded
            });
          } catch (error) {
            console.error('Failed to grade open-ended question:', error);
            // Default to 0 marks if AI grading fails
            aiFeedback.push({
              question_id: question.id,
              status: 'Incorrect',
              howToImprove: 'Unable to grade this question automatically.',
              marksAwarded: 0
            });
          }
        }
      }
      
      const maxMarks = calculateMaxMarks(questions);
      const timeTaken = Math.floor((Date.now() - currentAttempt.startTime) / 1000);
      
      // Create attempt record
      const attempt = await attemptService.createAttempt({
        exam_id: examId!,
        answers: currentAttempt.answers,
        total_marks: totalMarks,
        max_marks: maxMarks,
        ai_feedback: aiFeedback,
        time_taken: timeTaken,
      });
      
      // Clear attempt from store
      clearAttempt();
      
      // Navigate to results
      navigate(`/results/${attempt.id}`);
      
    } catch (error) {
      console.error('Failed to submit exam:', error);
      toast.error('Failed to submit exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    // Check for pending questions
    const answeredQuestions = questions.filter(q => getAnswer(q.id));
    const evaluatedQuestionsList = Array.from(evaluatedQuestions);
    const pendingQuestions = answeredQuestions.filter(q => !evaluatedQuestionsList.includes(q.id));
    
    if (pendingQuestions.length > 0) {
      setShowPendingQuestions(true);
    } else {
      setShowConfirmSubmit(true);
    }
  };

  const confirmSubmit = () => {
    setShowConfirmSubmit(false);
    submitExam();
  };

  const handleSkipPendingQuestions = async () => {
    setShowPendingQuestions(false);
    setShowConfirmSubmit(true);
  };

  const handleAttemptPendingQuestions = () => {
    setShowPendingQuestions(false);
    // Navigate to first pending question
    const answeredQuestions = questions.filter(q => getAnswer(q.id));
    const evaluatedQuestionsList = Array.from(evaluatedQuestions);
    const pendingQuestions = answeredQuestions.filter(q => !evaluatedQuestionsList.includes(q.id));
    
    if (pendingQuestions.length > 0) {
      const firstPendingIndex = questions.findIndex(q => q.id === pendingQuestions[0].id);
      setCurrentQuestionIndex(firstPendingIndex);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam not found</h2>
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

  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = questions.filter(q => getAnswer(q.id)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ExamHeader 
        exam={exam} 
        timeRemaining={timeRemaining}
        onBack={() => navigate('/')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Progress Tracker */}
          <div className="lg:col-span-1">
            <ProgressTracker
              questions={questions}
              currentIndex={currentQuestionIndex}
              onQuestionSelect={handleQuestionSelect}
              getAnswer={getAnswer}
              evaluatedQuestions={evaluatedQuestions}
            />
          </div>

          {/* Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Question Navigation */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === questions.length - 1}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-6">
                <QuestionRenderer
                  question={currentQuestion}
                  answer={getAnswer(currentQuestion.id)}
                  onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                  onSubmitAnswer={handleSubmitAnswer}
                  isEvaluated={evaluatedQuestions.has(currentQuestion.id)}
                  evaluationResult={questionEvaluations[currentQuestion.id]}
                  isSubmitting={submittingQuestion === currentQuestion.id}
                />
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSaveForLater}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Save for Later
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {answeredQuestions} of {questions.length} answered
                    </span>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Finish & Submit
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Questions Modal */}
      {showPendingQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Questions</h3>
            <p className="text-gray-600 mb-4">
              You have answered some questions but haven't submitted them for evaluation yet. 
              Would you like to evaluate them now or skip and submit the exam?
            </p>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Pending questions: {questions.filter(q => getAnswer(q.id) && !evaluatedQuestions.has(q.id)).length}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleAttemptPendingQuestions}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Evaluate Now
              </button>
              <button
                onClick={handleSkipPendingQuestions}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Skip & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Exam?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your exam? You have answered {answeredQuestions} out of {questions.length} questions.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttemptExam;
