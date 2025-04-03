-- Create interview_feedback table
CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score NUMERIC(5,2),
  category_scores JSONB,
  strengths TEXT[],
  areas_for_improvement TEXT[],
  final_assessment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own feedback"
  ON interview_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback"
  ON interview_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON interview_feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON interview_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- Add foreign key constraint to interviews table
ALTER TABLE interviews
ADD CONSTRAINT fk_feedback
FOREIGN KEY (feedback_id)
REFERENCES interview_feedback(id)
ON DELETE SET NULL; 