import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Question } from '../types/question.types';
import { ExamAnswer } from '../types/attempt.types';

interface ProgressTrackerProps {
  questions: Question[];
  currentIndex: number;
  onQuestionSelect: (index: number) => void;
  getAnswer: (questionId: string) => ExamAnswer | undefined;
  evaluatedQuestions?: Set<string>;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  questions,
  currentIndex,
  onQuestionSelect,
  getAnswer,
  evaluatedQuestions = new Set()
}) => {
  const answeredCount = questions.filter(q => getAnswer(q.id)).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Progress</h3>
          <span className="text-sm text-gray-600">
            {answeredCount}/{questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {Math.round(progressPercentage)}% complete
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Questions</h4>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const isAnswered = !!getAnswer(question.id);
            const isEvaluated = evaluatedQuestions.has(question.id);
            const isCurrent = index === currentIndex;
            
            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(index)}
                className={`
                  relative p-2 rounded-lg text-xs font-medium transition-colors duration-200
                  ${isCurrent 
                    ? 'bg-blue-100 text-blue-900 border-2 border-blue-300' 
                    : isEvaluated
                      ? 'bg-green-100 text-green-900 hover:bg-green-200'
                      : isAnswered 
                        ? 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <div className="flex items-center justify-center">
                  {isEvaluated ? (
                    <CheckCircleIcon className="h-4 w-4" />
                  ) : isAnswered ? (
                    <div className="h-4 w-4 border-2 border-yellow-500 rounded-full" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-gray-400 rounded-full" />
                  )}
                </div>
                <div className="mt-1">{index + 1}</div>
                
                {/* Question type indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center"
                     style={{
                       backgroundColor: question.type === 'mcq' ? '#3B82F6' : 
                                      question.type === 'fib' ? '#10B981' : '#8B5CF6',
                       color: 'white',
                       fontSize: '8px'
                     }}>
                  {question.type === 'mcq' ? 'M' : question.type === 'fib' ? 'F' : 'O'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>Evaluated</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            <span>Not answered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
