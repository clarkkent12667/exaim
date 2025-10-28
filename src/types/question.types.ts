export type QuestionType = 'mcq' | 'fib' | 'open';

export interface Question {
  id: string;
  exam_id: string;
  order_index: number;
  type: QuestionType;
  question_text: string;
  instruction_text?: string;
  marks: number;
  options?: string[]; // For MCQ
  correct_answer: any; // Can be number (MCQ), string (FIB), or object (Open)
  model_answer?: string;
  image_url?: string;
}

export interface CreateQuestionData {
  exam_id: string;
  order_index: number;
  type: QuestionType;
  question_text: string;
  instruction_text?: string;
  marks: number;
  options?: string[];
  correct_answer: any;
  model_answer?: string;
  image_url?: string;
}

export interface AIQuestionRequest {
  mcq_count: number;
  fib_count: number;
  open_count: number;
  subject: string;
  course: string;
  topic: string;
  sub_topic?: string;
  difficulty: string;
  pdf_text?: string;
  pdf_url?: string; // Add PDF URL support
}

export interface AIQuestionResponse {
  questions: {
    type: QuestionType;
    questionText: string;
    instructionText?: string;
    marks: number;
    options?: string[];
    correctOption?: number;
    modelAnswer?: string;
  }[];
}
