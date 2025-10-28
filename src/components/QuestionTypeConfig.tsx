import React from 'react';
import { QuestionType } from '../types/question.types';

interface QuestionCountData {
  mcq_count: number;
  fib_count: number;
  open_count: number;
}

interface QuestionTypeConfigProps {
  counts: QuestionCountData;
  onChange: (counts: QuestionCountData) => void;
}

const QuestionTypeConfig: React.FC<QuestionTypeConfigProps> = ({ counts, onChange }) => {
  const updateCount = (type: keyof QuestionCountData, value: number) => {
    const newCounts = { ...counts, [type]: Math.max(0, Math.min(50, value)) };
    onChange(newCounts);
  };

  const questionTypes = [
    {
      key: 'mcq_count' as keyof QuestionCountData,
      label: 'Multiple Choice Questions',
      description: 'Questions with 4 options, one correct answer',
      icon: '🔘',
      color: 'blue'
    },
    {
      key: 'fib_count' as keyof QuestionCountData,
      label: 'Fill in the Blanks',
      description: 'Questions with missing words or phrases to complete',
      icon: '📝',
      color: 'green'
    },
    {
      key: 'open_count' as keyof QuestionCountData,
      label: 'Open-ended Questions',
      description: 'Questions requiring detailed written responses',
      icon: '📄',
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-200 bg-blue-50';
      case 'green':
        return 'border-green-200 bg-green-50';
      case 'purple':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getButtonColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600 hover:text-blue-800';
      case 'green':
        return 'text-green-600 hover:text-green-800';
      case 'purple':
        return 'text-purple-600 hover:text-purple-800';
      default:
        return 'text-gray-600 hover:text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-2">Configure the number of questions for each type:</p>
        <p className="text-xs">Total questions: {counts.mcq_count + counts.fib_count + counts.open_count}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {questionTypes.map((type) => (
          <div
            key={type.key}
            className={`border-2 rounded-lg p-4 ${getColorClasses(type.color)}`}
          >
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">{type.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900">{type.label}</h3>
                <p className="text-xs text-gray-600">{type.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Count:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateCount(type.key, counts[type.key] - 1)}
                  disabled={counts[type.key] <= 0}
                  className={`p-1 rounded-full hover:bg-white disabled:opacity-50 ${getButtonColorClasses(type.color)}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                
                <span className="w-8 text-center font-medium text-gray-900">
                  {counts[type.key]}
                </span>
                
                <button
                  onClick={() => updateCount(type.key, counts[type.key] + 1)}
                  disabled={counts[type.key] >= 50}
                  className={`p-1 rounded-full hover:bg-white disabled:opacity-50 ${getButtonColorClasses(type.color)}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-3">
              <input
                type="range"
                min="0"
                max="50"
                value={counts[type.key]}
                onChange={(e) => updateCount(type.key, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>

      {counts.mcq_count + counts.fib_count + counts.open_count === 0 && (
        <div className="text-center py-4 text-red-600 text-sm">
          Please select at least one question type
        </div>
      )}
    </div>
  );
};

export default QuestionTypeConfig;
