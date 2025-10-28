export interface Attempt {
  id: string;
  exam_id: string;
  answers: Record<string, any>;
  total_marks: number;
  max_marks: number;
  ai_feedback: AIFeedback[];
  time_taken: number; // seconds
  submitted_at: string;
}

export interface AIFeedback {
  question_id: string;
  status: 'Correct' | 'Partially Correct' | 'Incorrect';
  howToImprove: string;
  marksAwarded: number;
}

export interface GradingRequest {
  studentAnswer: string;
  modelAnswer: string;
  marks: number;
}

export interface GradingResponse {
  status: 'Correct' | 'Partially Correct' | 'Incorrect';
  howToImprove: string;
  marksAwarded: number;
}

export interface ExamAnswer {
  question_id: string;
  answer: any;
  image_url?: string;
}
