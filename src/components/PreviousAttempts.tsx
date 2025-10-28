import React from 'react';
import { ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Attempt } from '../types/attempt.types';

interface PreviousAttemptsProps {
  attempts: Attempt[];
  currentAttemptId: string;
  onAttemptSelect: (attemptId: string) => void;
}

const PreviousAttempts: React.FC<PreviousAttemptsProps> = ({
  attempts,
  currentAttemptId,
  onAttemptSelect
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (attempts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Attempts</h3>
        <div className="text-center py-8">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No previous attempts</p>
          <p className="text-sm text-gray-400 mt-1">This is your first attempt</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Attempts</h3>
      
      <div className="space-y-3">
        {attempts.map((attempt) => {
          const percentage = Math.round((attempt.total_marks / attempt.max_marks) * 100);
          const isCurrentAttempt = attempt.id === currentAttemptId;
          
          return (
            <button
              key={attempt.id}
              onClick={() => onAttemptSelect(attempt.id)}
              className={`
                w-full p-4 rounded-lg border text-left transition-colors duration-200
                ${isCurrentAttempt 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatDate(attempt.submitted_at)}
                  </span>
                </div>
                <div className={`text-sm font-semibold ${getGradeColor(percentage)}`}>
                  {percentage}%
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{attempt.total_marks} / {attempt.max_marks} marks</span>
                <span>{formatTime(attempt.time_taken)}</span>
              </div>
              
              {isCurrentAttempt && (
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  Current attempt
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="mb-1">Click on any attempt to view detailed results</p>
          <p>Attempts are ordered by most recent first</p>
        </div>
      </div>
    </div>
  );
};

export default PreviousAttempts;
