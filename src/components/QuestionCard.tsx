import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Question, QuestionType } from '../types/question.types';
import ImageUpload from './ImageUpload';

interface QuestionCardProps {
  question: Question;
  onUpdate?: (updates: Partial<Question>) => void;
}

const questionSchema = z.object({
  question_text: z.string().min(1, 'Question text is required'),
  instruction_text: z.string().optional(),
  marks: z.number().min(1).max(100),
  type: z.enum(['mcq', 'fib', 'open']),
  options: z.array(z.string()).optional(),
  correct_answer: z.any(),
  model_answer: z.string().optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(question.image_url || '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_text: question.question_text,
      instruction_text: question.instruction_text || '',
      marks: question.marks,
      type: question.type,
      options: question.options || ['', '', '', ''],
      correct_answer: question.correct_answer,
      model_answer: question.model_answer || '',
    },
  });

  const watchedType = watch('type');
  const watchedOptions = watch('options');

  const onSubmit = (data: QuestionFormData) => {
    const updates: Partial<Question> = {
      ...data,
      image_url: imageUrl,
    };
    
    if (onUpdate) {
      onUpdate(updates);
    }
    setIsEditing(false);
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  const addOption = () => {
    const currentOptions = watchedOptions || [];
    setValue('options', [...currentOptions, '']);
  };

  const removeOption = (index: number) => {
    const currentOptions = watchedOptions || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    setValue('options', newOptions);
    
    // Adjust correct answer if needed
    const currentCorrectAnswer = watch('correct_answer');
    if (typeof currentCorrectAnswer === 'number' && currentCorrectAnswer >= index) {
      setValue('correct_answer', Math.max(0, currentCorrectAnswer - 1));
    }
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = watchedOptions || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    setValue('options', newOptions);
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-900 font-medium">{question.question_text}</p>
            {question.instruction_text && (
              <p className="text-sm text-gray-600 mt-1">{question.instruction_text}</p>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
        </div>

        {question.image_url && (
          <div className="mt-2">
            <img
              src={question.image_url}
              alt="Question"
              className="max-w-xs rounded-lg"
            />
          </div>
        )}

        {question.type === 'mcq' && question.options && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
            <div className="space-y-1">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    index === question.correct_answer
                      ? 'bg-green-100 border border-green-300'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                  {index === question.correct_answer && (
                    <span className="ml-2 text-green-600 text-sm">✓ Correct</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {question.type === 'fib' && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700">Correct Answer:</p>
            <p className="text-gray-900 bg-gray-100 p-2 rounded">{question.correct_answer}</p>
          </div>
        )}

        {question.type === 'open' && question.model_answer && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700">Model Answer:</p>
            <p className="text-gray-900 bg-gray-100 p-2 rounded">{question.model_answer}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{question.marks} mark{question.marks !== 1 ? 's' : ''}</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Question Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
        <select
          {...register('type')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="mcq">Multiple Choice</option>
          <option value="fib">Fill in the Blanks</option>
          <option value="open">Open-ended</option>
        </select>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
        <textarea
          {...register('question_text')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your question here..."
        />
        {errors.question_text && (
          <p className="mt-1 text-sm text-red-600">{errors.question_text.message}</p>
        )}
      </div>

      {/* Instruction Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Instruction Text</label>
        <input
          type="text"
          {...register('instruction_text')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Choose the best answer, Fill in the blank..."
        />
      </div>

      {/* Marks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
        <input
          type="number"
          {...register('marks', { valueAsNumber: true })}
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.marks && (
          <p className="mt-1 text-sm text-red-600">{errors.marks.message}</p>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Image (Optional)</label>
        <ImageUpload
          onImageUpload={handleImageUpload}
          currentImageUrl={imageUrl}
          folderName="question-images"
        />
      </div>

      {/* MCQ Options */}
      {watchedType === 'mcq' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          <div className="space-y-2">
            {watchedOptions?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="font-medium w-6">{String.fromCharCode(65 + index)}.</span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${index + 1}`}
                />
                {watchedOptions && watchedOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {watchedOptions && watchedOptions.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Option
              </button>
            )}
          </div>

          {/* Correct Answer */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
            <select
              {...register('correct_answer', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {watchedOptions?.map((_, index) => (
                <option key={index} value={index}>
                  {String.fromCharCode(65 + index)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* FIB Correct Answer */}
      {watchedType === 'fib' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
          <input
            type="text"
            {...register('correct_answer')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the correct answer..."
          />
        </div>
      )}

      {/* Open-ended Model Answer */}
      {watchedType === 'open' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Model Answer</label>
          <textarea
            {...register('model_answer')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the model answer for grading..."
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default QuestionCard;
