# AI Exam Builder App

A comprehensive web application for creating and taking exams with AI-powered question generation and grading. Built with React, Supabase, and OpenAI GPT-4o-mini.

## Features

### 🎯 Core Functionality
- **AI-Powered Exam Creation**: Generate questions from PDF uploads or metadata
- **Manual Exam Building**: Create custom questions with drag-and-drop editing
- **Multiple Question Types**: MCQ, Fill-in-the-Blanks, and Open-ended questions
- **Smart Grading**: Auto-grading for MCQ/FIB, AI-assisted grading for open-ended
- **Exam Attempts**: Full exam interface with timer, progress tracking, and auto-save
- **Detailed Results**: Comprehensive feedback with AI suggestions for improvement

### 🛠️ Technical Features
- **Responsive Design**: Mobile-friendly interface
- **Real-time Auto-save**: Progress saved every 30 seconds
- **Timer Support**: Optional exam timers with auto-submission
- **Image Support**: Upload images for questions and answers
- **Previous Attempts**: View and compare past exam attempts
- **Anonymous Access**: No authentication required

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **State Management**: Zustand
- **Backend**: Supabase (Database + Storage + Edge Functions)
- **AI**: OpenAI GPT-4o-mini
- **UI Components**: HeadlessUI + Heroicons
- **Form Handling**: React Hook Form + Zod validation
- **Drag & Drop**: @dnd-kit

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ai-exam-builder-app
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a storage bucket named `exam-files` with public read access
4. Run the database migration:

```sql
-- Copy and paste the contents of supabase/migrations/001_create_tables.sql
-- into the Supabase SQL editor and execute
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Edge Functions

Deploy the Edge Functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your_project_ref

# Deploy functions
supabase functions deploy generate-questions
supabase functions deploy grade-open-ended
```

### 5. Edge Function Environment Variables

Set the OpenAI API key for the Edge Functions:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key
```

### 6. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage Guide

### Creating an Exam

1. **Navigate to Create**: Click "Create New Exam" on the homepage
2. **Fill Exam Details**: Enter exam name, subject, topic, difficulty, etc.
3. **Upload PDF (Optional)**: Upload study material for AI to generate questions from
4. **Configure Questions**: Set the number of MCQ, FIB, and open-ended questions
5. **Generate with AI**: Click "Generate with AI" to create questions automatically
6. **Edit Questions**: Review, edit, reorder, and customize generated questions
7. **Publish**: Save as draft or publish the exam

### Taking an Exam

1. **Select Exam**: Choose an exam from the homepage
2. **Start Attempt**: Click "Start Exam" to begin
3. **Answer Questions**: Navigate through questions using the progress tracker
4. **Save Progress**: Use "Save for Later" or auto-save will handle it
5. **Submit**: Click "Finish & Submit" when done
6. **View Results**: Review detailed feedback and AI suggestions

### Question Types

- **Multiple Choice**: Select from 4 options (auto-graded)
- **Fill in the Blanks**: Complete missing words/phrases (auto-graded)
- **Open-ended**: Detailed written responses (AI-graded with feedback)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ExamCard.tsx
│   ├── ExamBuilderForm.tsx
│   ├── ExamHeader.tsx
│   ├── ImageUpload.tsx
│   ├── PDFUploadZone.tsx
│   ├── ProgressTracker.tsx
│   ├── QuestionCard.tsx
│   ├── QuestionList.tsx
│   ├── QuestionRenderer.tsx
│   ├── QuestionReview.tsx
│   ├── QuestionTypeConfig.tsx
│   ├── ResultsSummary.tsx
│   └── PreviousAttempts.tsx
├── pages/              # Main application pages
│   ├── Home.tsx
│   ├── CreateExam.tsx
│   ├── EditExam.tsx
│   ├── AttemptExam.tsx
│   └── Results.tsx
├── lib/                # API and utility functions
│   ├── api.ts
│   ├── grading.ts
│   └── supabase.ts
├── store/              # Zustand state management
│   └── examStore.ts
├── types/              # TypeScript type definitions
│   ├── exam.types.ts
│   ├── question.types.ts
│   └── attempt.types.ts
└── App.tsx             # Main app component
```

## Database Schema

### Tables

- **exams**: Exam metadata and settings
- **questions**: Individual questions with answers and options
- **attempts**: Student attempts with answers and AI feedback

### Storage Buckets

- **exam-files**: PDFs, question images, and answer attachments

## API Endpoints

### Supabase Edge Functions

- **generate-questions**: Generates questions using OpenAI GPT-4o-mini
- **grade-open-ended**: Grades open-ended questions with AI feedback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed description

## Roadmap

- [ ] Question tagging and categorization
- [ ] Analytics dashboard
- [ ] PDF export functionality
- [ ] Collaborative editing
- [ ] Advanced AI features
- [ ] Mobile app
