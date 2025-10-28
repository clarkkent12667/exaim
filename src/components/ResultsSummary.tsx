import React from 'react';
import { ClockIcon, ChartBarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Attempt } from '../types/attempt.types';
import { Exam } from '../types/exam.types';

interface ResultsSummaryProps {
  attempt: Attempt;
  exam: Exam;
  percentage: number;
  gradeColor: string;
  gradeLabel: string;
  timeTaken: string;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  attempt,
  exam,
  percentage,
  gradeColor,
  gradeLabel,
  timeTaken
}) => {
  const correctQuestions = attempt.ai_feedback.filter(f => f.status === 'Correct').length;
  const partiallyCorrectQuestions = attempt.ai_feedback.filter(f => f.status === 'Partially Correct').length;
  const incorrectQuestions = attempt.ai_feedback.filter(f => f.status === 'Incorrect').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${gradeColor} mb-2`}>
            {percentage}%
          </div>
          <div className="text-lg font-medium text-gray-900 mb-1">
            {gradeLabel}
          </div>
          <div className="text-sm text-gray-600">
            {attempt.total_marks} / {attempt.max_marks} marks
          </div>
        </div>

        {/* Time Taken */}
        <div className="text-center">
          <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-lg font-medium text-gray-900 mb-1">
            {timeTaken}
          </div>
          <div className="text-sm text-gray-600">
            Time taken
          </div>
        </div>

        {/* Correct Answers */}
        <div className="text-center">
          <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-lg font-medium text-gray-900 mb-1">
            {correctQuestions}
          </div>
          <div className="text-sm text-gray-600">
            Correct answers
          </div>
        </div>

        {/* Performance Chart */}
        <div className="text-center">
          <ChartBarIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-lg font-medium text-gray-900 mb-1">
            {partiallyCorrectQuestions}
          </div>
          <div className="text-sm text-gray-600">
            Partially correct
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Performance</span>
          <span className="text-sm text-gray-600">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              percentage >= 80 ? 'bg-green-500' :
              percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-green-800">{correctQuestions}</div>
          <div className="text-sm text-green-600">Correct</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-lg font-semibold text-yellow-800">{partiallyCorrectQuestions}</div>
          <div className="text-sm text-yellow-600">Partial</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-semibold text-red-800">{incorrectQuestions}</div>
          <div className="text-sm text-red-600">Incorrect</div>
        </div>
      </div>

      {/* Exam Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Subject:</span>
            <span className="ml-2 text-gray-600">{exam.subject}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Topic:</span>
            <span className="ml-2 text-gray-600">{exam.topic}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Difficulty:</span>
            <span className="ml-2 text-gray-600">{exam.difficulty}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Submitted:</span>
            <span className="ml-2 text-gray-600">
              {new Date(attempt.submitted_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSummary;
