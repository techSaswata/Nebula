-- Create a function to get random questions
CREATE OR REPLACE FUNCTION get_random_questions(num_questions integer)
RETURNS SETOF interview_questions AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM interview_questions
  ORDER BY random()
  LIMIT num_questions;
END;
$$ LANGUAGE plpgsql; 