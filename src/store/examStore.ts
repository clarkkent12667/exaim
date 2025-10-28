import { create } from 'zustand';
import { Exam } from '../types/exam.types';
import { Question } from '../types/question.types';
import { ExamAnswer } from '../types/attempt.types';

interface ExamStore {
  // Current exam being created/edited
  currentExam: Exam | null;
  currentQuestions: Question[];
  
  // Current attempt
  currentAttempt: {
    examId: string;
    answers: Record<string, ExamAnswer>;
    startTime: number;
  } | null;
  
  // Actions
  setCurrentExam: (exam: Exam | null) => void;
  setCurrentQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  reorderQuestions: (questions: Question[]) => void;
  
  // Attempt actions
  startAttempt: (examId: string) => void;
  updateAnswer: (questionId: string, answer: ExamAnswer) => void;
  getAnswer: (questionId: string) => ExamAnswer | undefined;
  clearAttempt: () => void;
  
  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  currentExam: null,
  currentQuestions: [],
  currentAttempt: null,
  
  setCurrentExam: (exam) => set({ currentExam: exam }),
  
  setCurrentQuestions: (questions) => set({ currentQuestions: questions }),
  
  addQuestion: (question) => set((state) => ({
    currentQuestions: [...state.currentQuestions, question]
  })),
  
  updateQuestion: (id, updates) => set((state) => ({
    currentQuestions: state.currentQuestions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    )
  })),
  
  deleteQuestion: (id) => set((state) => ({
    currentQuestions: state.currentQuestions.filter(q => q.id !== id)
  })),
  
  reorderQuestions: (questions) => set({ currentQuestions: questions }),
  
  startAttempt: (examId) => set({
    currentAttempt: {
      examId,
      answers: {},
      startTime: Date.now()
    }
  }),
  
  updateAnswer: (questionId, answer) => set((state) => {
    if (!state.currentAttempt) return state;
    
    return {
      currentAttempt: {
        ...state.currentAttempt,
        answers: {
          ...state.currentAttempt.answers,
          [questionId]: answer
        }
      }
    };
  }),
  
  getAnswer: (questionId) => {
    const state = get();
    return state.currentAttempt?.answers[questionId];
  },
  
  clearAttempt: () => set({ currentAttempt: null }),
  
  saveToLocalStorage: () => {
    const state = get();
    if (state.currentAttempt) {
      localStorage.setItem('examAttempt', JSON.stringify(state.currentAttempt));
    }
  },
  
  loadFromLocalStorage: () => {
    const saved = localStorage.getItem('examAttempt');
    if (saved) {
      try {
        const attempt = JSON.parse(saved);
        set({ currentAttempt: attempt });
      } catch (error) {
        console.error('Failed to load attempt from localStorage:', error);
      }
    }
  }
}));
