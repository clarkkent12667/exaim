import React from 'react';
import { Question, QuestionType } from '../types/question.types';
import { ExamAnswer } from '../types/attempt.types';
import { MCQFeedback, FIBFeedback } from '../lib/grading';

interface QuestionRendererProps {
  question: Question;
  answer?: ExamAnswer;
  onAnswerChange: (answer: ExamAnswer) => void;
  onSubmitAnswer?: (questionId: string) => Promise<void>;
  isEvaluated?: boolean;
  evaluationResult?: {
    status: 'Correct' | 'Partially Correct' | 'Incorrect';
    marksAwarded: number;
    feedback?: string;
    correctAnswer?: any;
    correctOptionText?: string;
  };
  isSubmitting?: boolean;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answer,
  onAnswerChange,
  onSubmitAnswer,
  isEvaluated = false,
  evaluationResult,
  isSubmitting = false
}) => {
  const handleAnswerChange = (newAnswer: any) => {
    onAnswerChange({
      question_id: question.id,
      answer: newAnswer
    });
  };

  const renderMCQ = () => (
    <div className="space-y-3">
      {question.options?.map((option, index) => {
        const isSelected = answer?.answer === index;
        const isCorrect = index === question.correct_answer;
        const isQuestionEvaluated = isEvaluated && evaluationResult;
        
        return (
          <label
            key={index}
            className={`
              flex items-center p-3 rounded-lg border cursor-pointer transition-colors duration-200
              ${isSelected 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${isQuestionEvaluated && isCorrect ? 'border-green-500 bg-green-50' : ''}
              ${isQuestionEvaluated && isSelected && !isCorrect ? 'border-red-500 bg-red-50' : ''}
            `}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={index}
              checked={isSelected}
              onChange={() => handleAnswerChange(index)}
              className="sr-only"
              disabled={isQuestionEvaluated}
            />
            <div className={`
              w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
              ${isSelected 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
              }
              ${isQuestionEvaluated && isCorrect ? 'border-green-500 bg-green-500' : ''}
              ${isQuestionEvaluated && isSelected && !isCorrect ? 'border-red-500 bg-red-500' : ''}
            `}>
              {(isSelected || (isQuestionEvaluated && isCorrect)) && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
            <span className="flex-1 text-gray-900">{option}</span>
            {isQuestionEvaluated && isCorrect && (
              <span className="text-green-600 text-sm font-medium">✓ Correct Answer</span>
            )}
            {isQuestionEvaluated && isSelected && !isCorrect && (
              <span className="text-red-600 text-sm font-medium">✗ Your Answer</span>
            )}
          </label>
        );
      })}
    </div>
  );

  const renderFIB = () => {
    // For FIB questions, we need to handle multiple blanks
    // Split the answer into an array if it's a string, or use the answer as-is if it's already an array
    const answers = Array.isArray(answer?.answer) 
      ? answer.answer 
      : answer?.answer 
        ? [answer.answer] // Single answer for single blank
        : []; // No answers yet
    
    const blanks = question.question_text.split('___');
    const blankCount = blanks.length - 1;
    
    // Ensure we have enough answer slots for all blanks
    while (answers.length < blankCount) {
      answers.push('');
    }
    
    const handleBlankChange = (blankIndex: number, value: string) => {
      const newAnswers = [...answers];
      newAnswers[blankIndex] = value;
      handleAnswerChange(newAnswers);
    };

    return (
      <div className="space-y-4">
        <div className="text-gray-900">
          {blanks.map((part, index) => (
            <span key={index}>
              {part}
              {index < blanks.length - 1 && (
                <input
                  type="text"
                  value={answers[index] || ''}
                  onChange={(e) => handleBlankChange(index, e.target.value)}
                  className={`inline-block mx-2 px-2 py-1 border-b-2 bg-transparent focus:outline-none min-w-[100px] ${
                    isEvaluated && evaluationResult
                      ? evaluationResult.status === 'Correct'
                        ? 'border-green-500 text-green-700'
                        : 'border-red-500 text-red-700'
                      : 'border-blue-500 focus:border-blue-700'
                  }`}
                  placeholder="Answer"
                  disabled={isEvaluated && evaluationResult}
                />
              )}
            </span>
          ))}
        </div>
        
        {/* Show correct answer if wrong */}
        {isEvaluated && evaluationResult && evaluationResult.status !== 'Correct' && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Correct Answer:</strong> {evaluationResult.correctAnswer}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderOpenEnded = () => (
    <div className="space-y-4">
      <textarea
        value={answer?.answer || ''}
        onChange={(e) => handleAnswerChange(e.target.value)}
        rows={6}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
          isEvaluated && evaluationResult
            ? evaluationResult.status === 'Correct'
              ? 'border-green-300 focus:ring-green-500'
              : 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
        placeholder="Type your answer here..."
        disabled={isEvaluated && evaluationResult}
      />
    </div>
  );

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'mcq':
        return 'Multiple Choice';
      case 'fib':
        return 'Fill in the Blank';
      case 'open':
        return 'Open-ended';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${question.type === 'mcq' ? 'bg-blue-100 text-blue-800' :
                question.type === 'fib' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'}
            `}>
              {getQuestionTypeLabel(question.type)}
            </span>
            <span className="text-sm text-gray-500">
              {question.marks} mark{question.marks !== 1 ? 's' : ''}
            </span>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {question.question_text}
          </h3>
          
          {question.instruction_text && (
            <p className="text-sm text-gray-600 italic">
              {question.instruction_text}
            </p>
          )}
        </div>
      </div>

      {/* Question Image */}
      {question.image_url && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <img
            src={question.image_url}
            alt="Question"
            className="w-full max-w-md mx-auto"
          />
        </div>
      )}

      {/* Answer Input */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Your Answer:</h4>
        
        {question.type === 'mcq' && renderMCQ()}
        {question.type === 'fib' && renderFIB()}
        {question.type === 'open' && renderOpenEnded()}

        {/* Submit Answer Button */}
        {onSubmitAnswer && !isEvaluated && (() => {
          // Check if there's a valid answer based on question type
          const hasValidAnswer = (() => {
            if (!answer?.answer) return false;
            
            if (question.type === 'mcq') {
              return typeof answer.answer === 'number' && answer.answer >= 0;
            } else if (question.type === 'fib') {
              if (Array.isArray(answer.answer)) {
                return answer.answer.some(a => a && a.trim() !== '');
              }
              return answer.answer && answer.answer.trim() !== '';
            } else if (question.type === 'open') {
              return answer.answer && answer.answer.trim() !== '';
            }
            return false;
          })();
          
          return (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onSubmitAnswer(question.id)}
              disabled={!hasValidAnswer || isSubmitting}
              className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                !hasValidAnswer || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
            </button>
          </div>
          );
        })()}

        {/* Evaluation Result */}
        {isEvaluated && evaluationResult && (
          <div className={`mt-6 p-4 rounded-lg border-2 ${
            evaluationResult.status === 'Correct' 
              ? 'bg-green-50 border-green-200' 
              : evaluationResult.status === 'Partially Correct'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h5 className={`font-medium ${
                evaluationResult.status === 'Correct' 
                  ? 'text-green-800' 
                  : evaluationResult.status === 'Partially Correct'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                {evaluationResult.status}
              </h5>
              <span className={`font-bold ${
                evaluationResult.status === 'Correct' 
                  ? 'text-green-600' 
                  : evaluationResult.status === 'Partially Correct'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {evaluationResult.marksAwarded}/{question.marks} marks
              </span>
            </div>
            
            {evaluationResult.feedback && (
              <div className={`text-sm ${
                evaluationResult.status === 'Correct' 
                  ? 'text-green-700' 
                  : evaluationResult.status === 'Partially Correct'
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                {/* For open-ended questions, parse the feedback to separate improvement suggestions and correct answer */}
                {question.type === 'open' && evaluationResult.status !== 'Correct' ? (
                  <div className="space-y-3">
                    <div>
                      <strong>How to improve:</strong>
                      <p className="mt-1">
                        {evaluationResult.feedback.includes('Here is the correct answer:') 
                          ? evaluationResult.feedback.split('Here is the correct answer:')[0].trim()
                          : evaluationResult.feedback
                        }
                      </p>
                    </div>
                    {evaluationResult.feedback.includes('Here is the correct answer:') && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <strong>Correct Answer:</strong>
                        <p className="mt-1">
                          {evaluationResult.feedback.split('Here is the correct answer:')[1].trim()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{evaluationResult.feedback}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default QuestionRenderer;
