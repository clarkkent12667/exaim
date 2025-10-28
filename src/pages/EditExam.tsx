import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import QuestionList from '../components/QuestionList';
import { useExamStore } from '../store/examStore';
import { examService, questionService } from '../lib/api';
import { Exam, CreateExamData } from '../types/exam.types';
import { Question, CreateQuestionData, QuestionType } from '../types/question.types';

const EditExam: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentExam, currentQuestions, setCurrentExam, setCurrentQuestions } = useExamStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (examId) {
      loadExamData();
    }
  }, [examId]);

  const loadExamData = async () => {
    if (!examId) return;
    
    try {
      setLoading(true);
      
      // Load exam details
      const exam = await examService.getExam(examId);
      setCurrentExam(exam);
      
      // Load questions
      const questions = await questionService.getQuestionsByExam(examId);
      setCurrentQuestions(questions);
      
      // Check if we have generated questions from AI
      const generatedQuestions = location.state?.generatedQuestions;
      const isNewExam = location.state?.isNewExam;
      if (generatedQuestions && questions.length === 0 && isNewExam) {
        await createQuestionsFromAI(generatedQuestions, examId);
      }
      
    } catch (error) {
      console.error('Failed to load exam:', error);
      toast.error('Failed to load exam');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const createQuestionsFromAI = async (aiQuestions: any[], examId: string) => {
    try {
      // First, check if questions already exist for this exam
      const existingQuestions = await questionService.getQuestionsByExam(examId);
      if (existingQuestions.length > 0) {
        console.log('Questions already exist for this exam, skipping creation');
        setCurrentQuestions(existingQuestions);
        return;
      }

      const questionsToCreate: CreateQuestionData[] = aiQuestions.map((q, index) => ({
        exam_id: examId,
        order_index: index,
        type: q.type as QuestionType,
        question_text: q.questionText,
        instruction_text: q.instructionText || '',
        marks: q.marks,
        options: q.options || [],
        correct_answer: q.type === 'mcq' ? q.correctOption : q.modelAnswer,
        model_answer: q.modelAnswer || '',
      }));

      const createdQuestions = await questionService.bulkUpsertQuestions(questionsToCreate);
      setCurrentQuestions(createdQuestions);
      toast.success('Questions created from AI generation');
      
    } catch (error) {
      console.error('Failed to create questions:', error);
      toast.error('Failed to create questions from AI generation');
    }
  };

  const handleSaveDraft = async () => {
    if (!currentExam) return;
    
    setSaving(true);
    try {
      await examService.updateExam(currentExam.id, {
        settings: {
          ...currentExam.settings,
          published: false,
        }
      });
      
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!currentExam || currentQuestions.length === 0) {
      toast.error('Cannot publish exam without questions');
      return;
    }
    
    setPublishing(true);
    try {
      await examService.updateExam(currentExam.id, {
        settings: {
          ...currentExam.settings,
          published: true,
        }
      });
      
      toast.success('Exam published successfully!');
      navigate('/');
    } catch (error) {
      console.error('Failed to publish exam:', error);
      toast.error('Failed to publish exam');
    } finally {
      setPublishing(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: CreateQuestionData = {
      exam_id: examId!,
      order_index: currentQuestions.length,
      type: 'mcq',
      question_text: '',
      instruction_text: '',
      marks: 1,
      options: ['', '', '', ''],
      correct_answer: 0,
      model_answer: '',
    };

    setCurrentQuestions([...currentQuestions, newQuestion as Question]);
  };

  const handlePreview = () => {
    navigate(`/attempt/${examId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentExam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentExam.name}</h1>
                <p className="text-gray-600 mt-1">
                  {currentExam.subject} • {currentExam.topic} • {currentQuestions.length} questions
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreview}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </button>
              
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              
              <button
                onClick={handlePublish}
                disabled={publishing || currentQuestions.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {publishing ? 'Publishing...' : 'Publish Exam'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
              <button
                onClick={handleAddQuestion}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Question
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {currentQuestions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No questions yet</p>
                <button
                  onClick={handleAddQuestion}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Question
                </button>
              </div>
            ) : (
              <QuestionList examId={examId!} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExam;
