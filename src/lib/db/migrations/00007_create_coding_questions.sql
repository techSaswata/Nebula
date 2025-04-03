-- Create interview_questions table
CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  approach TEXT NOT NULL,
  type TEXT NOT NULL,
  solution TEXT NOT NULL,
  category TEXT NOT NULL,
  topic TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Questions are viewable by everyone"
  ON interview_questions FOR SELECT
  USING (true);

-- Only allow admins to modify questions
CREATE POLICY "Only admins can insert questions"
  ON interview_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update questions"
  ON interview_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert some sample questions
INSERT INTO interview_questions (question, approach, type, solution, category, topic) VALUES
(
  'Given an array of integers, find two numbers that add up to a target sum.',
  'Use a hash map to store complements while iterating through the array once.',
  'algorithm',
  'function twoSum(nums: number[], target: number): number[] {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (map.has(complement)) {
        return [map.get(complement), i];
      }
      map.set(nums[i], i);
    }
    return [];
  }',
  'Arrays & Hashing',
  'Two Sum'
),
(
  'Implement a function to check if a binary tree is balanced.',
  'Use a recursive approach to check the height difference between left and right subtrees.',
  'data_structure',
  'function isBalanced(root: TreeNode | null): boolean {
    function getHeight(node: TreeNode | null): number {
      if (!node) return 0;
      const left = getHeight(node.left);
      if (left === -1) return -1;
      const right = getHeight(node.right);
      if (right === -1) return -1;
      if (Math.abs(left - right) > 1) return -1;
      return Math.max(left, right) + 1;
    }
    return getHeight(root) !== -1;
  }',
  'Trees',
  'Balanced Binary Tree'
); 