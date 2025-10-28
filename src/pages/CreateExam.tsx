import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ExamBuilderForm from '../components/ExamBuilderForm';
import PDFUploadZone from '../components/PDFUploadZone';
import QuestionTypeConfig from '../components/QuestionTypeConfig';
import { examService, aiService, storageService } from '../lib/api';
import { CreateExamData } from '../types/exam.types';
import { AIQuestionRequest } from '../types/question.types';
import { extractTextFromPDF, PDFExtractionResult } from '../lib/pdfExtractor';

const examSchema = z.object({
  name: z.string().min(1, 'Exam name is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  board: z.string().min(1, 'Exam board is required'),
  subject: z.string().min(1, 'Subject is required'),
  course: z.string().min(1, 'Course is required'),
  topic: z.string().optional(),
  sub_topic: z.string().optional(),
  difficulty: z.string().min(1, 'Difficulty is required'),
});

const questionCountSchema = z.object({
  mcq_count: z.number().min(0).max(50),
  fib_count: z.number().min(0).max(50),
  open_count: z.number().min(0).max(50),
}).refine(data => data.mcq_count + data.fib_count + data.open_count > 0, {
  message: 'At least one question type must be selected',
  path: ['mcq_count']
});

type ExamFormData = z.infer<typeof examSchema>;
type QuestionCountData = z.infer<typeof questionCountSchema>;

const CreateExam: React.FC = () => {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfText, setPdfText] = useState<string>('');
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionCounts, setQuestionCounts] = useState<QuestionCountData>({
    mcq_count: 5,
    fib_count: 3,
    open_count: 2,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
  });

  const watchedValues = watch();

  const handlePdfUpload = async (file: File) => {
    try {
      setIsExtractingText(true);
      
      // First, extract text from PDF
      console.log('Extracting text from PDF...');
      const extractionResult: PDFExtractionResult = await extractTextFromPDF(file);
      
      if (!extractionResult.success) {
        throw new Error(extractionResult.error || 'Failed to extract text from PDF');
      }
      
      console.log('PDF text extracted successfully:', {
        textLength: extractionResult.text.length,
        pageCount: extractionResult.pageCount
      });
      
      // Store the extracted text
      setPdfText(extractionResult.text);
      
      // Then upload the file to storage
      const fileName = `pdfs/${Date.now()}-${file.name}`;
      const url = await storageService.uploadFile('exam-files', fileName, file);
      
      setPdfFile(file);
      setPdfUrl(url);
      
      toast.success(`PDF uploaded and processed successfully! Extracted text from ${extractionResult.pageCount} pages.`);
      
    } catch (error) {
      console.error('PDF upload/processing failed:', error);
      toast.error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Reset states on error
      setPdfFile(null);
      setPdfUrl('');
      setPdfText('');
    } finally {
      setIsExtractingText(false);
    }
  };

  const handleGenerateWithAI = async (data: ExamFormData) => {
    setIsGenerating(true);
    
    try {
      // Create exam first
      const examData: CreateExamData = {
        ...data,
        pdf_url: pdfUrl || undefined,
        settings: {
          published: false,
        },
      };

      const exam = await examService.createExam(examData);

      // Generate questions with AI
      const aiRequest: AIQuestionRequest = {
        mcq_count: questionCounts.mcq_count,
        fib_count: questionCounts.fib_count,
        open_count: questionCounts.open_count,
        subject: data.subject,
        course: data.course,
        topic: data.topic,
        sub_topic: data.sub_topic,
        difficulty: data.difficulty,
        pdf_text: pdfText || undefined, // Use extracted PDF text
        pdf_url: pdfUrl || undefined, // Keep URL as backup
      };

      const aiResponse = await aiService.generateQuestions(aiRequest);
      
      const successMessage = pdfText 
        ? `Questions generated successfully using PDF content (${pdfText.length} characters)!`
        : 'Questions generated successfully!';
      
      toast.success(successMessage);
      
      // Navigate to edit page with generated questions
      navigate(`/edit/${exam.id}`, { 
        state: { 
          generatedQuestions: aiResponse.questions,
          isNewExam: true 
        } 
      });
      
    } catch (error) {
      console.error('Failed to generate exam:', error);
      toast.error('Failed to generate exam. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualBuild = async (data: ExamFormData) => {
    try {
      const examData: CreateExamData = {
        ...data,
        pdf_url: pdfUrl || undefined,
        settings: {
          published: false,
        },
      };

      const exam = await examService.createExam(examData);
      
      toast.success('Exam created successfully!');
      navigate(`/edit/${exam.id}`, { state: { isNewExam: true } });
      
    } catch (error) {
      console.error('Failed to create exam:', error);
      toast.error('Failed to create exam. Please try again.');
    }
  };

  const onSubmit = (data: ExamFormData) => {
    // This will be handled by the specific button clicks
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
              <p className="text-gray-600 mt-1">Build an exam manually or with AI assistance</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Exam Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Exam Details</h2>
            <ExamBuilderForm register={register} errors={errors} watch={watch} setValue={setValue} />
          </div>

          {/* PDF Upload */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Study Material (Optional)</h2>
            <PDFUploadZone onFileUpload={handlePdfUpload} uploadedFile={pdfFile} />
            {isExtractingText && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <p className="text-blue-800">Extracting text from PDF...</p>
                </div>
              </div>
            )}
            {pdfText && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✅ PDF text extracted successfully ({pdfText.length} characters)
                </p>
              </div>
            )}
          </div>

          {/* Question Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Question Configuration</h2>
            <QuestionTypeConfig 
              counts={questionCounts} 
              onChange={setQuestionCounts}
            />
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleSubmit(handleGenerateWithAI)}
                disabled={isGenerating}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating with AI...
                  </>
                ) : (
                  'Generate with AI'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleSubmit(handleManualBuild)}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manual Build
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4 text-center">
              AI generation will create questions based on your exam details{pdfFile ? ' and uploaded PDF' : ''}. 
              Manual build lets you create questions from scratch.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
