-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  qualification TEXT NOT NULL,
  board TEXT NOT NULL,
  subject TEXT NOT NULL,
  course TEXT NOT NULL,
  topic TEXT,
  sub_topic TEXT,
  difficulty TEXT NOT NULL,
  pdf_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mcq', 'fib', 'open')),
  question_text TEXT NOT NULL,
  instruction_text TEXT,
  marks INTEGER NOT NULL DEFAULT 1,
  options JSONB,
  correct_answer JSONB NOT NULL,
  model_answer TEXT,
  image_url TEXT
);

-- Create attempts table
CREATE TABLE IF NOT EXISTS attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  total_marks NUMERIC NOT NULL DEFAULT 0,
  max_marks NUMERIC NOT NULL DEFAULT 0,
  ai_feedback JSONB DEFAULT '[]',
  time_taken INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(exam_id, order_index);
CREATE INDEX IF NOT EXISTS idx_attempts_exam_id ON attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exams_published ON exams USING GIN ((settings->'published'));

-- Enable Row Level Security
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Allow anonymous read access to published exams" ON exams
  FOR SELECT USING ((settings->>'published')::boolean = true);

CREATE POLICY "Allow anonymous read access to questions" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access to exams" ON exams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to exams" ON exams
  FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous insert access to questions" ON questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to questions" ON questions
  FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete access to questions" ON questions
  FOR DELETE USING (true);

CREATE POLICY "Allow anonymous insert access to attempts" ON attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read access to attempts" ON attempts
  FOR SELECT USING (true);
