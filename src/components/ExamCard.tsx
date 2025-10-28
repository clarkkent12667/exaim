import React from 'react';
import { Link } from 'react-router-dom';
import { Exam } from '../types/exam.types';
import { PlayIcon, ClockIcon, AcademicCapIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ExamCardProps {
  exam: Exam;
  onDelete?: (examId: string) => void;
  isDeleting?: boolean;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onDelete, isDeleting }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {exam.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <AcademicCapIcon className="h-4 w-4 mr-1" />
              {exam.subject} • {exam.course}
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {exam.topic}
              {exam.sub_topic && ` • ${exam.sub_topic}`}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
            {exam.difficulty}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {exam.settings?.timer_enabled ? `${exam.settings.timer_minutes} min` : 'No timer'}
          </div>
          <div>
            {exam.settings?.reattempts_allowed !== undefined && (
              <span>{exam.settings.reattempts_allowed} attempts allowed</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{exam.board}</span> • {exam.qualification}
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/attempt/${exam.id}`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlayIcon className="h-4 w-4 mr-1" />
              Start Exam
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(exam.id)}
                disabled={isDeleting}
                className="inline-flex items-center px-2 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                title="Delete Exam"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCard;
