import { QuestionType } from '../types/question.types';

export const normalizeAnswer = (answer: string): string => {
  return answer.trim().toLowerCase().replace(/[^\w\s]/g, '');
};

export interface MCQFeedback {
  isCorrect: boolean;
  feedback: string;
  correctAnswer: number;
  correctOptionText: string;
}

export interface FIBFeedback {
  isCorrect: boolean;
  feedback: string;
  correctAnswer: string;
}

export const gradeMCQ = (studentAnswer: number, correctAnswer: number, options: string[]): MCQFeedback => {
  const isCorrect = studentAnswer === correctAnswer;
  const correctOptionText = options[correctAnswer] || '';
  
  return {
    isCorrect,
    feedback: isCorrect 
      ? 'Correct! Well done.' 
      : `Incorrect. The correct answer is: ${correctOptionText}`,
    correctAnswer,
    correctOptionText
  };
};

export const gradeFIB = (studentAnswer: string | string[], correctAnswer: string): FIBFeedback => {
  // Handle both single string answers and array of answers
  const normalizedStudent = Array.isArray(studentAnswer) 
    ? studentAnswer.join(' ').trim().toLowerCase().replace(/[^\w\s]/g, '')
    : normalizeAnswer(studentAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  const isCorrect = normalizedStudent === normalizedCorrect;
  
  return {
    isCorrect,
    feedback: isCorrect 
      ? 'Correct! Good work.' 
      : `Incorrect. The correct answer is: ${correctAnswer}`,
    correctAnswer
  };
};

export const calculateTotalMarks = (questions: any[], answers: Record<string, any>): number => {
  let total = 0;
  
  questions.forEach(question => {
    const answer = answers[question.id];
    if (!answer) return;
    
    switch (question.type) {
      case 'mcq':
        if (gradeMCQ(answer, question.correct_answer, question.options || []).isCorrect) {
          total += question.marks;
        }
        break;
      case 'fib':
        if (gradeFIB(answer, question.correct_answer).isCorrect) {
          total += question.marks;
        }
        break;
      case 'open':
        // Open-ended questions are graded by AI, marks will be added later
        break;
    }
  });
  
  return total;
};

export const calculateMaxMarks = (questions: any[]): number => {
  return questions.reduce((total, question) => total + question.marks, 0);
};
