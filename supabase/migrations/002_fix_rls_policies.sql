-- Fix RLS policies to allow anonymous exam creation
-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous insert access to exams" ON exams;
DROP POLICY IF EXISTS "Allow anonymous update access to exams" ON exams;

-- Create new policies that work with anonymous users
CREATE POLICY "Allow anonymous insert access to exams" ON exams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to exams" ON exams
  FOR UPDATE USING (true);

-- Also ensure the topic column is nullable
ALTER TABLE exams ALTER COLUMN topic DROP NOT NULL;
