import { Exam, CreateExamData } from '../types/exam.types';
import { Question, CreateQuestionData, AIQuestionRequest, AIQuestionResponse } from '../types/question.types';
import { Attempt, GradingRequest, GradingResponse } from '../types/attempt.types';
import { supabase, supabaseAdmin } from './supabase';

// Exam operations
export const examService = {
  async createExam(data: CreateExamData): Promise<Exam> {
    // Ensure topic is handled properly (can be null/undefined)
    const examData = {
      ...data,
      topic: data.topic || null,
      sub_topic: data.sub_topic || null
    };
    
    // Use admin client to bypass RLS if available, otherwise use regular client
    const client = supabaseAdmin || supabase;
    
    const { data: exam, error } = await client
      .from('exams')
      .insert(examData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return exam;
  },

  async getExam(id: string): Promise<Exam> {
    const { data: exam, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return exam;
  },

  async getAllExams(): Promise<Exam[]> {
    const { data: exams, error } = await supabase
      .from('exams')
      .select('*')
      .eq('settings->published', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return exams;
  },

  async updateExam(id: string, data: Partial<CreateExamData>): Promise<Exam> {
    const { data: exam, error } = await supabase
      .from('exams')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return exam;
  },

  async deleteExam(id: string): Promise<void> {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getAllExamsForAdmin(): Promise<Exam[]> {
    // Get all exams including unpublished ones for admin purposes
    const { data: exams, error } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return exams;
  }
};

// Question operations
export const questionService = {
  async createQuestion(data: CreateQuestionData): Promise<Question> {
    const { data: question, error } = await supabase
      .from('questions')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return question;
  },

  async getQuestionsByExam(examId: string): Promise<Question[]> {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', examId)
      .order('order_index');
    
    if (error) throw error;
    return questions;
  },

  async updateQuestion(id: string, data: Partial<CreateQuestionData>): Promise<Question> {
    const { data: question, error } = await supabase
      .from('questions')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return question;
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async bulkUpsertQuestions(questions: CreateQuestionData[]): Promise<Question[]> {
    // Use upsert with conflict resolution to handle potential duplicates
    // Using column names instead of constraint name for better compatibility
    const { data, error } = await supabase
      .from('questions')
      .upsert(questions, { 
        onConflict: 'exam_id,question_text',
        ignoreDuplicates: false 
      })
      .select();
    
    if (error) throw error;
    return data;
  },

  async cleanupDuplicateQuestions(examId: string): Promise<void> {
    // This function will be implemented after the migration runs
    // For now, we'll just log that cleanup is needed
    console.log(`Cleanup needed for exam ${examId} - run migration 003_fix_question_duplicates.sql`);
  }
};

// AI operations
export const aiService = {
  async generateQuestions(request: AIQuestionRequest): Promise<AIQuestionResponse> {
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: request
    });
    
    if (error) throw error;
    return data;
  },

  async gradeOpenEnded(request: GradingRequest): Promise<GradingResponse> {
    const { data, error } = await supabase.functions.invoke('grade-open-ended', {
      body: request
    });
    
    if (error) throw error;
    return data;
  }
};

// Attempt operations
export const attemptService = {
  async createAttempt(data: Omit<Attempt, 'id' | 'submitted_at'>): Promise<Attempt> {
    const { data: attempt, error } = await supabase
      .from('attempts')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return attempt;
  },

  async getAttempt(id: string): Promise<Attempt> {
    const { data: attempt, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return attempt;
  },

  async getAttemptsByExam(examId: string): Promise<Attempt[]> {
    const { data: attempts, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('exam_id', examId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return attempts;
  }
};

// Storage operations
export const storageService = {
  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return publicUrl;
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  }
};
