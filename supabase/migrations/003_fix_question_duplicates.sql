-- Fix question duplication issues
-- Add unique constraint to prevent duplicate questions per exam
ALTER TABLE questions ADD CONSTRAINT unique_exam_order UNIQUE (exam_id, order_index);

-- Add unique constraint to prevent duplicate question text per exam
ALTER TABLE questions ADD CONSTRAINT unique_exam_question_text UNIQUE (exam_id, question_text);

-- Create a function to clean up duplicate questions (keep the first one)
CREATE OR REPLACE FUNCTION cleanup_duplicate_questions()
RETURNS void AS $$
BEGIN
  -- Delete duplicate questions based on exam_id and question_text, keeping the one with lowest order_index
  DELETE FROM questions 
  WHERE id IN (
    SELECT id FROM (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY exam_id, question_text ORDER BY order_index) as rn
      FROM questions
    ) t 
    WHERE rn > 1
  );
END;
$$ LANGUAGE plpgsql;

-- Run the cleanup function
SELECT cleanup_duplicate_questions();

-- Drop the cleanup function as it's no longer needed
DROP FUNCTION cleanup_duplicate_questions();
