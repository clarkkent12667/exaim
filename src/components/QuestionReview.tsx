import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Question } from '../types/question.types';
import { AIFeedback } from '../types/attempt.types';

interface QuestionReviewProps {
  question: Question;
  questionNumber: number;
  studentAnswer: any;
  aiFeedback?: AIFeedback;
}

const QuestionReview: React.FC<QuestionReviewProps> = ({
  question,
  questionNumber,
  studentAnswer,
  aiFeedback
}) => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Correct':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'Partially Correct':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'Incorrect':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Correct':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Partially Correct':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Incorrect':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderMCQAnswer = () => {
    const selectedOption = question.options?.[studentAnswer?.answer] || 'No answer';
    const correctOption = question.options?.[question.correct_answer] || 'Unknown';
    
    return (
      <div className="space-y-2">
        <div>
          <span className="font-medium text-gray-700">Your answer:</span>
          <div className={`p-2 rounded ${
            studentAnswer?.answer === question.correct_answer 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {selectedOption}
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Correct answer:</span>
          <div className="p-2 rounded bg-gray-50 border border-gray-200">
            {correctOption}
          </div>
        </div>
      </div>
    );
  };

  const renderFIBAnswer = () => {
    // Handle both old string format and new array format for FIB answers
    const displayAnswer = (() => {
      if (!studentAnswer?.answer) return 'No answer';
      
      if (Array.isArray(studentAnswer.answer)) {
        // For multiple blanks, show each answer separated by semicolons
        return studentAnswer.answer.join('; ');
      }
      
      // For single blank or old format
      return studentAnswer.answer;
    })();

    // Format the correct answer to match the display format
    const displayCorrectAnswer = (() => {
      if (!question.correct_answer) return 'No correct answer';
      
      // If correct answer contains semicolons, it's already formatted for multiple blanks
      if (question.correct_answer.includes(';')) {
        return question.correct_answer;
      }
      
      // For single blank, return as is
      return question.correct_answer;
    })();

    return (
      <div className="space-y-2">
        <div>
          <span className="font-medium text-gray-700">Your answer:</span>
          <div className={`p-2 rounded ${
            studentAnswer?.answer === question.correct_answer 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {displayAnswer}
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Correct answer:</span>
          <div className="p-2 rounded bg-gray-50 border border-gray-200">
            {displayCorrectAnswer}
          </div>
        </div>
      </div>
    );
  };

  const renderOpenEndedAnswer = () => {
    return (
      <div className="space-y-3">
        <div>
          <span className="font-medium text-gray-700">Your answer:</span>
          <div className="p-3 rounded bg-gray-50 border border-gray-200">
            <p className="text-gray-900 whitespace-pre-wrap">
              {studentAnswer?.answer || 'No answer provided'}
            </p>
            {studentAnswer?.image_url && (
              <div className="mt-3">
                <img
                  src={studentAnswer.image_url}
                  alt="Answer attachment"
                  className="max-w-xs rounded border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>
        
        {question.model_answer && !aiFeedback && (
          <div>
            <span className="font-medium text-gray-700">Model answer:</span>
            <div className="p-3 rounded bg-blue-50 border border-blue-200">
              <p className="text-gray-900 whitespace-pre-wrap">
                {question.model_answer}
              </p>
            </div>
          </div>
        )}
        
        {aiFeedback && (
          <div>
            <span className="font-medium text-gray-700">AI Feedback:</span>
            <div className="p-3 rounded bg-yellow-50 border border-yellow-200">
              {/* Parse the feedback to separate improvement suggestions and correct answer */}
              {aiFeedback.howToImprove.includes('Here is the correct answer:') ? (
                <div className="space-y-3">
                  <div>
                    <strong className="text-gray-800">How to improve:</strong>
                    <p className="mt-1 text-gray-900">
                      {aiFeedback.howToImprove.split('Here is the correct answer:')[0].trim()}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <strong className="text-gray-800">Correct Answer:</strong>
                    <p className="mt-1 text-gray-900">
                      {aiFeedback.howToImprove.split('Here is the correct answer:')[1].trim()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-900">{aiFeedback.howToImprove}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnswer = () => {
    switch (question.type) {
      case 'mcq':
        return renderMCQAnswer();
      case 'fib':
        return renderFIBAnswer();
      case 'open':
        return renderOpenEndedAnswer();
      default:
        return null;
    }
  };

  const getMarksAwarded = () => {
    if (aiFeedback) {
      return aiFeedback.marksAwarded;
    }
    
    // For MCQ and FIB, check if answer is correct
    if (question.type === 'mcq') {
      return studentAnswer?.answer === question.correct_answer ? question.marks : 0;
    } else if (question.type === 'fib') {
      // Handle both array and string answers for FIB
      if (Array.isArray(studentAnswer?.answer)) {
        const studentAnswerStr = studentAnswer.answer.join(' ').trim().toLowerCase().replace(/[^\w\s]/g, '');
        const correctAnswerStr = question.correct_answer.trim().toLowerCase().replace(/[^\w\s]/g, '');
        return studentAnswerStr === correctAnswerStr ? question.marks : 0;
      } else {
        return studentAnswer?.answer === question.correct_answer ? question.marks : 0;
      }
    }
    
    return 0;
  };

  const marksAwarded = getMarksAwarded();
  const status = aiFeedback?.status || (marksAwarded === question.marks ? 'Correct' : marksAwarded > 0 ? 'Partially Correct' : 'Incorrect');

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-lg font-semibold text-gray-900">
              Question {questionNumber}
            </span>
            <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${question.type === 'mcq' ? 'bg-blue-100 text-blue-800' :
                question.type === 'fib' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'}
            `}>
              {question.type.toUpperCase()}
            </span>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              <span className="ml-1">{status}</span>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {question.question_text}
          </h3>
          
          {question.instruction_text && (
            <p className="text-sm text-gray-600 italic mb-3">
              {question.instruction_text}
            </p>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{marksAwarded}</span> / {question.marks} marks
          </div>
        </div>
      </div>

      {/* Question Image */}
      {question.image_url && (
        <div className="mb-4">
          <img
            src={question.image_url}
            alt="Question"
            className="max-w-md rounded border border-gray-200"
          />
        </div>
      )}

      {/* Answer Review */}
      <div className="border-t border-gray-200 pt-4">
        {renderAnswer()}
      </div>
    </div>
  );
};

export default QuestionReview;
