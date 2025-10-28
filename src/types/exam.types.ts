export interface Exam {
  id: string;
  name: string;
  qualification: string;
  board: string;
  subject: string;
  course: string;
  topic: string;
  sub_topic?: string;
  difficulty: string;
  pdf_url?: string;
  settings: ExamSettings;
  created_at: string;
}

export interface ExamSettings {
  timer_enabled?: boolean;
  timer_minutes?: number;
  reattempts_allowed?: number;
  published?: boolean;
}

export interface CreateExamData {
  name: string;
  qualification: string;
  board: string;
  subject: string;
  course: string;
  topic?: string;
  sub_topic?: string;
  difficulty: string;
  pdf_url?: string;
  settings?: ExamSettings;
}
