export interface Course {
  id: string
  title: string
  description: string
  price: number
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
  created_at: string
  updated_at: string
} 