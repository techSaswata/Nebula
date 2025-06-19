# Nebula - NSET Preparation Platform

Nebula is a comprehensive platform designed to help students prepare for the Scaler School of Technology entrance exam (NSET). It offers a range of tools including mock tests, interview preparation, scheduling, and performance tracking.

## Features

- **Comprehensive Study Material**: Access to detailed notes, video lectures, and practice questions covering all NSET topics.
- **Mock Tests**: Practice with full-length tests that simulate the actual NSET exam environment.
- **AI-Powered Interview Preparation**: Practice interview skills with AI-driven mock interviews.
- **Interview Scheduling**: Schedule and manage mock interviews with mentors.
- **Performance Analytics**: Track progress with detailed analytics and identify areas for improvement.
- **Expert Guidance**: Get personalized feedback from experienced mentors.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **APIs**: Stripe for payments
- **UI Components**: Radix UI, Lucide React icons

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nebula.git
   cd nebula
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/src/app`: Main application code
  - `/api`: API routes
  - `/auth`: Authentication pages
  - `/dashboard`: User dashboard
  - `/courses`: Course listings
  - `/exam`: Exam preparation
  - `/interview`: Interview preparation
  - `/schedule-interview`: Interview scheduling
  - `/schedule-mentorship`: Mentorship scheduling
  - `/progress`: Progress tracking

- `/src/components`: Reusable UI components
- `/src/lib`: Utility functions and configuration
- `/src/contexts`: React contexts for state management
- `/src/types`: TypeScript type definitions

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:
- `interviews`: Stores scheduled interviews
- `questions`: Stores interview questions
- `answers`: Stores user answers to questions
- `interview_feedback`: Stores feedback for completed interviews

