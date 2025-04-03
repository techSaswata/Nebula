-- Create questions_test table
CREATE TABLE IF NOT EXISTS questions_test (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  correct_answers TEXT NOT NULL,
  difficulty TEXT,
  category TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE questions_test ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Questions test are viewable by everyone"
  ON questions_test FOR SELECT
  USING (true);

-- Only allow admins to modify questions_test
CREATE POLICY "Only admins can insert questions"
  ON questions_test FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update questions"
  ON questions_test FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can delete questions"
  ON questions_test FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  ); 