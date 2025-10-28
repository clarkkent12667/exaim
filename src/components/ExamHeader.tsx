import React from 'react';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Exam } from '../types/exam.types';

interface ExamHeaderProps {
  exam: Exam;
  timeRemaining: number | null;
  onBack: () => void;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({ exam, timeRemaining, onBack }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    if (seconds <= 300) return 'text-red-600'; // 5 minutes
    if (seconds <= 600) return 'text-yellow-600'; // 10 minutes
    return 'text-gray-600';
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.name}</h1>
              <p className="text-gray-600">
                {exam.subject} • {exam.topic} • {exam.difficulty}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Timer */}
            {timeRemaining !== null && (
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className={`text-lg font-mono font-semibold ${getTimeColor(timeRemaining)}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            
            {/* Exam Info */}
            <div className="text-right">
              <div className="text-sm text-gray-600">
                <div>{exam.board} • {exam.qualification}</div>
                {exam.settings?.reattempts_allowed !== undefined && (
                  <div>{exam.settings.reattempts_allowed} attempts allowed</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
