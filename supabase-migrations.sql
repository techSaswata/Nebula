-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  user_id TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled',
  duration INTEGER NOT NULL,
  position TEXT,
  company TEXT,
  notes TEXT,
  feedback_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview_feedback table
CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  category_scores JSONB NOT NULL,
  strengths TEXT[] NOT NULL,
  areas_for_improvement TEXT[] NOT NULL,
  final_assessment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Set up RLS policies
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Interviews policies
CREATE POLICY "Interviews are viewable by the creator"
  ON interviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Interviews can be created by authenticated users"
  ON interviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Interviews can be updated by the creator"
  ON interviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Questions policies
CREATE POLICY "Questions are viewable by anyone"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Questions can be created by authenticated users"
  ON questions FOR INSERT
  WITH CHECK (true);

-- Interview feedback policies
CREATE POLICY "Feedback is viewable by the creator"
  ON interview_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Feedback can be created by authenticated users"
  ON interview_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Feedback can be updated by the creator"
  ON interview_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Answers policies
CREATE POLICY "Answers are viewable by the creator"
  ON answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Answers can be created by authenticated users"
  ON answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_questions_interview_id ON questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_feedback_interview_id ON interview_feedback(interview_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_interview_id ON answers(interview_id); 