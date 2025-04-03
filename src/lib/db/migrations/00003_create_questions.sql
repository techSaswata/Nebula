-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view questions for their interviews"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = questions.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create questions for their interviews"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions for their interviews"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = questions.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions for their interviews"
  ON questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = questions.interview_id
      AND interviews.user_id = auth.uid()
    )
  ); 