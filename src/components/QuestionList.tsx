import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrashIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useExamStore } from '../store/examStore';
import { questionService } from '../lib/api';
import { Question, QuestionType } from '../types/question.types';
import QuestionCard from './QuestionCard';
import toast from 'react-hot-toast';

interface QuestionListProps {
  examId: string;
}

interface SortableQuestionItemProps {
  question: Question;
  onDelete: (id: string) => void;
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({ question, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <button
              {...attributes}
              {...listeners}
              className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900">
                Question {question.order_index + 1}
              </span>
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                question.type === 'mcq' ? 'bg-blue-100 text-blue-800' :
                question.type === 'fib' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {question.type.toUpperCase()}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                {question.marks} mark{question.marks !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button
            onClick={() => onDelete(question.id)}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <QuestionCard question={question} />
        </div>
      </div>
    </div>
  );
};

const QuestionList: React.FC<QuestionListProps> = ({ examId }) => {
  const { currentQuestions, setCurrentQuestions, updateQuestion, deleteQuestion } = useExamStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = currentQuestions.findIndex(q => q.id === active.id);
      const newIndex = currentQuestions.findIndex(q => q.id === over.id);

      const newQuestions = arrayMove(currentQuestions, oldIndex, newIndex);
      
      // Update order_index for all questions
      const updatedQuestions = newQuestions.map((q, index) => ({
        ...q,
        order_index: index,
      }));

      setCurrentQuestions(updatedQuestions);

      // Update in database
      try {
        await questionService.bulkUpsertQuestions(updatedQuestions);
        toast.success('Question order updated');
      } catch (error) {
        console.error('Failed to update question order:', error);
        toast.error('Failed to update question order');
        // Revert on error
        setCurrentQuestions(currentQuestions);
      }
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    setDeletingId(questionId);
    try {
      await questionService.deleteQuestion(questionId);
      deleteQuestion(questionId);
      
      // Update order_index for remaining questions
      const remainingQuestions = currentQuestions
        .filter(q => q.id !== questionId)
        .map((q, index) => ({ ...q, order_index: index }));
      
      setCurrentQuestions(remainingQuestions);
      
      // Update order_index in database
      if (remainingQuestions.length > 0) {
        await questionService.bulkUpsertQuestions(remainingQuestions);
      }
      
      toast.success('Question deleted');
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast.error('Failed to delete question');
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuestionUpdate = async (questionId: string, updates: Partial<Question>) => {
    try {
      await questionService.updateQuestion(questionId, updates);
      updateQuestion(questionId, updates);
      toast.success('Question updated');
    } catch (error) {
      console.error('Failed to update question:', error);
      toast.error('Failed to update question');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={currentQuestions.map(q => q.id)}
        strategy={verticalListSortingStrategy}
      >
        {currentQuestions.map((question) => (
          <SortableQuestionItem
            key={question.id}
            question={question}
            onDelete={handleDeleteQuestion}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default QuestionList;
