"use client";

import { useState, useEffect } from "react";
import { X, Award, CheckCircle, AlertTriangle, Download, ExternalLink, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { DetailedFeedback } from "@/lib/types";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface FeedbackPopupProps {
  feedback: DetailedFeedback | null;
  onClose: () => void;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface QuestionItem {
  id: string;
  question: string;
  approach: string;
  solution: string;
  topic: string;
  isCorrect: boolean;
  isWrong?: boolean;
  isUnattempted?: boolean;
  expectedAnswer?: string;
  userAnswer?: string;
}

const FeedbackPopup = ({ feedback, onClose }: FeedbackPopupProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  useEffect(() => {
    if (feedback) {
      fetchQuestions();
    }
  }, [feedback]);

  const fetchQuestions = async () => {
    if (!feedback) return;
    
    try {
      const questionIds = [
        ...Object.keys(feedback.correctAnswers || {}),
        ...Object.keys(feedback.wrongAnswers || {}),
        ...Object.keys(feedback.unattemptedAnswers || {})
      ];
      
      if (questionIds.length === 0) return;
      
      const response = await fetch('/api/questions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: questionIds })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
      }
      
      const data = await response.json();
      
      const questionsWithStatus = data.map((q: QuestionItem) => {
        const isCorrect = feedback.correctAnswers && feedback.correctAnswers[q.id] !== undefined;
        const isWrong = feedback.wrongAnswers && feedback.wrongAnswers[q.id] !== undefined;
        const isUnattempted = feedback.unattemptedAnswers && feedback.unattemptedAnswers[q.id] !== undefined;
        
        let userAnswer = "Not attempted";
        if (isCorrect && feedback.correctAnswers) {
          userAnswer = feedback.correctAnswers[q.id];
        } else if (isWrong && feedback.wrongAnswers) {
          userAnswer = feedback.wrongAnswers[q.id];
        } else if (isUnattempted && feedback.unattemptedAnswers) {
          userAnswer = feedback.unattemptedAnswers[q.id];
        }
        
        return {
          ...q,
          isCorrect,
          isWrong,
          isUnattempted,
          userAnswer,
          expectedAnswer: q.solution || q.expectedAnswer
        };
      });
      
      setQuestions(questionsWithStatus);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  // Function to ensure topics from unattempted questions are included
  const ensureUnattemptedTopics = () => {
    if (!feedback || !questions || questions.length === 0) return;

    try {
      // Get unattempted questions and their topics
      const unattemptedQuestions = questions.filter(q => q.isUnattempted);
      const unattemptedTopics = unattemptedQuestions
        .map(q => q.topic)
        .filter(Boolean) as string[];
      
      if (unattemptedTopics.length === 0) return;
      
      // Get the formatted topics object
      const formattedTopics = getFormattedTopics();
      
      // Add any missing topics
      unattemptedTopics.forEach(topic => {
        if (!formattedTopics.unattempted.includes(topic)) {
          formattedTopics.unattempted.push(topic);
        }
      });
    } catch (error) {
      console.error("Error ensuring unattempted topics:", error);
    }
  };

  // Call this function when questions are loaded
  useEffect(() => {
    if (questions.length > 0) {
      ensureUnattemptedTopics();
    }
  }, [questions]);

  if (!feedback) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-4">Error Loading Feedback</h2>
          <p className="text-gray-600 mb-4">Unable to load feedback data. Please try again later.</p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  const getPassStatusDisplay = (feedback: DetailedFeedback) => {
    const totalScore = feedback.totalScore;
    const completionScore = feedback.categoryScores.questionCompletion;
    
    if (totalScore >= 8 && completionScore >= 7) {
      return { 
        status: 'Selected', 
        color: 'bg-green-100 text-green-800 border border-green-200', 
        iconColor: 'text-green-600',
        icon: CheckCircle2,
        message: 'Strong overall performance and excellent question completion rate.' 
      };
    } else if (totalScore >= 7 && completionScore >= 6) {
      return { 
        status: 'Selected', 
        color: 'bg-green-100 text-green-800 border border-green-200', 
        iconColor: 'text-green-600',
        icon: CheckCircle2,
        message: 'Good performance across all areas with satisfactory question completion.' 
      };
    } else if (totalScore >= 6 && completionScore >= 5) {
      return { 
        status: 'Waitlisted', 
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
        iconColor: 'text-yellow-600',
        icon: Clock,
        message: 'Shows potential but needs improvement in some areas.' 
      };
    } else {
      return { 
        status: 'Not Selected', 
        color: 'bg-red-100 text-red-800 border border-red-200', 
        iconColor: 'text-red-600',
        icon: XCircle,
        message: 'Does not meet required criteria.' 
      };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const { status, color, message, icon: StatusIcon, iconColor } = getPassStatusDisplay(feedback);

  const formattedDate = new Date(feedback.createdAt || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const downloadFeedback = () => {
    if (!feedback) return;

    const feedbackContent = `
# Interview Feedback Report

## Overall Score: ${feedback.totalScore}/10

## Question Performance
- Correct Answers: ${Object.keys(feedback.correctAnswers).length}
- Wrong Answers: ${Object.keys(feedback.wrongAnswers).length}
- Unattempted Questions: ${Object.keys(feedback.unattemptedAnswers).length}

## Topics Performance
Strong Topics:
${feedback.topicsToImprove.correct.map(topic => `- ${topic}`).join('\n')}

Topics to Improve:
${feedback.topicsToImprove.wrong.map(topic => `- ${topic}`).join('\n')}

## Detailed Assessment
${feedback.finalAssessment}
    `;

    const blob = new Blob([feedbackContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-feedback.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categoryScores = feedback.categoryScores || {
    communicationSkills: 0,
    technicalKnowledge: 0,
    problemSolving: 0,
    culturalAndRoleFit: 0,
    confidenceAndClarity: 0,
    questionCompletion: 0
  };

  const detailedRemarks = feedback.detailedRemarks || {
    communication: "No remarks available",
    technical: "No remarks available",
    problemSolving: "No remarks available",
    cultural: "No remarks available",
    completion: "No completion remarks available",
    overall: "No overall assessment available"
  };

  const getChartData = (): ChartDataItem[] => {
    const formattedTopics = getFormattedTopics();
    
    if (formattedTopics.correct.length === 0 && 
        formattedTopics.wrong.length === 0 && 
        formattedTopics.unattempted.length === 0) {
      return [{ name: 'No Topics Attempted', value: 1, color: '#94a3b8' }];
    }
    
    const data: ChartDataItem[] = [];
    
    // Add data only for non-empty categories
    if (formattedTopics.correct.length > 0) {
      data.push({ 
        name: formattedTopics.correct, 
        value: formattedTopics.correct.length, 
        color: '#4ade80' 
      });
    }
    
    if (formattedTopics.wrong.length > 0) {
      data.push({ 
        name: formattedTopics.wrong, 
        value: formattedTopics.wrong.length, 
        color: '#f97316' 
      });
    }

    if (formattedTopics.unattempted.length > 0) {
      data.push({ 
        name: formattedTopics.unattempted, 
        value: formattedTopics.unattempted.length, 
        color: '#94a3b8' 
      });
    }
    
    return data;
  };

  const getQuestionStats = () => {
    const correctCount = Object.keys(feedback?.correctAnswers || {}).length;
    const wrongCount = Object.keys(feedback?.wrongAnswers || {}).length;
    const unattemptedCount = Object.keys(feedback?.unattemptedAnswers || {}).length;
    const totalQuestions = correctCount + wrongCount + unattemptedCount;

    // Calculate completion score (5 points per correct answer out of total questions)
    const completionScore = (correctCount / totalQuestions) * 10;

    return {
      correctCount,
      wrongCount,
      unattemptedCount,
      totalQuestions,
      completionRate: `${correctCount}/${totalQuestions}`,
      completionScore: completionScore.toFixed(1)
    };
  };

  // Format the assessment text to show correct completion rate
  const formatAssessmentText = (text: string) => {
    if (!text) return text;
    
    const questionStats = getQuestionStats();
    // Replace incorrect completion statements with correct ones
    return text.replace(
      /Completed \d+\/\d+ questions successfully/g,
      `Completed ${questionStats.correctCount}/${questionStats.totalQuestions} questions successfully`
    );
  };

  // Format strengths to show correct completion rate
  const getFormattedStrengths = () => {
    const questionStats = getQuestionStats();
    return (feedback.strengths || []).map(strength => {
      // Replace incorrect statements about question completion
      if (strength.includes('questions answered correctly')) {
        return strength.replace(
          /\d+\/\d+ questions answered correctly/g,
          `${questionStats.correctCount}/${questionStats.totalQuestions} questions answered correctly`
        );
      }
      return strength;
    });
  };

  // Ensure topics_to_improve is properly formatted and contains all data
  const getFormattedTopics = () => {
    if (!feedback?.topicsToImprove) return { correct: [], wrong: [], unattempted: [] };
    
    // Handle string or object format
    const topicsToImprove = typeof feedback.topicsToImprove === 'string'
      ? JSON.parse(feedback.topicsToImprove)
      : feedback.topicsToImprove;
    
    // Ensure each category exists
    const formatted = {
      correct: topicsToImprove.correct || [],
      wrong: topicsToImprove.wrong || [],
      unattempted: topicsToImprove.unattempted || []
    };
    
    // If we have questions loaded but unattempted topics are empty,
    // extract them from the questions
    if (questions.length > 0 && formatted.unattempted.length === 0) {
      const unattemptedQuestions = questions.filter(q => q.isUnattempted);
      unattemptedQuestions.forEach(q => {
        if (q.topic && !formatted.unattempted.includes(q.topic)) {
          formatted.unattempted.push(q.topic);
        }
      });
    }
    
    return formatted;
  };
  
  const questionStats = getQuestionStats();
  const formattedTopics = getFormattedTopics();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            Interview Feedback
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold">
                Overall Score:{" "}
                <span className={getScoreColor(feedback.totalScore || 0)}>
                  {feedback.totalScore || 0}/10
                </span>
              </h3>
              <p className="text-gray-600">{formattedDate}</p>
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${color}`}>
              <StatusIcon className={`h-5 w-5 ${iconColor}`} />
              <span className="font-medium">{status}</span>
            </div>
          </div>

          <div className="border-b mb-6">
            <div className="flex space-x-6">
              {["overview", "detailed", "solutions", "recommendations"].map((tab) => (
                <button
                  key={tab}
                  className={`py-2 px-1 border-b-2 ${
                    activeTab === tab
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-6 text-center text-lg">Performance Summary</h4>
                <div className="space-y-12">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 text-center mb-4">Topic Performance</h5>
                    <div className="h-[400px] w-full max-w-2xl mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getChartData()}
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, value}: {name: string, value: number}) => 
                              name === 'No Topics Attempted' ? name : `${name}: ${value}`
                            }
                            labelLine={true}
                          >
                            {getChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string) => {
                              if (name === 'No Topics Attempted') return ['No topics attempted yet', ''];
                              return [`${value} ${value === 1 ? 'topic' : 'topics'}`, name];
                            }} 
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value: string) => {
                              const data = getChartData().find(item => item.name === value);
                              if (data?.name === 'No Topics Attempted') return 'No topics attempted yet';
                              return value;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 text-center mb-4">Category Scores</h5>
                    <div className="h-[400px] w-full max-w-2xl mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Communication', value: categoryScores.communicationSkills, color: '#60a5fa' },
                              { name: 'Technical', value: categoryScores.technicalKnowledge, color: '#34d399' },
                              { name: 'Problem Solving', value: categoryScores.problemSolving, color: '#a78bfa' },
                              { name: 'Culture Fit', value: categoryScores.culturalAndRoleFit, color: '#fbbf24' },
                              { name: 'Confidence', value: categoryScores.confidenceAndClarity, color: '#f87171' },
                              { name: 'Question Completion', value: parseFloat(questionStats.completionScore), color: '#94a3b8' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, value}: {name: string, value: number}) => `${name}: ${value}/10`}
                            labelLine={true}
                          >
                            {[
                              { name: 'Communication', value: categoryScores.communicationSkills, color: '#60a5fa' },
                              { name: 'Technical', value: categoryScores.technicalKnowledge, color: '#34d399' },
                              { name: 'Problem Solving', value: categoryScores.problemSolving, color: '#a78bfa' },
                              { name: 'Culture Fit', value: categoryScores.culturalAndRoleFit, color: '#fbbf24' },
                              { name: 'Confidence', value: categoryScores.confidenceAndClarity, color: '#f87171' },
                              { name: 'Question Completion', value: parseFloat(questionStats.completionScore), color: '#94a3b8' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value}/10`, 'Score']} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="font-medium">Questions Answered Correctly:</span>{" "}
                      {questionStats.correctCount}
                    </div>
                    <div>
                      <span className="font-medium">Questions Answered Incorrectly:</span>{" "}
                      {questionStats.wrongCount}
                    </div>
                    <div>
                      <span className="font-medium">Questions Unattempted:</span>{" "}
                      {questionStats.unattemptedCount}
                    </div>
                  </div>
                  <div className="mt-3 text-sm">
                    <span className="font-medium">Strong Topics:</span>{" "}
                    {formattedTopics.correct.join(', ') || 'None identified'}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Topics to Improve:</span>{" "}
                    {formattedTopics.wrong.join(', ') || 'None identified'}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Unattempted Topics:</span>{" "}
                    {formattedTopics.unattempted.join(', ') || 'None identified'}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">Assessment Summary</h4>
                <div className="text-gray-800 prose prose-sm max-w-none">
                  {detailedRemarks.overall ? (
                    <ReactMarkdown>{formatAssessmentText(detailedRemarks.overall)}</ReactMarkdown>
                  ) : (
                    <p>No assessment provided.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Category Scores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CategoryScore 
                    label="Communication Skills" 
                    score={categoryScores.communicationSkills}
                    description="Clarity, articulation, structured responses"
                  />
                  <CategoryScore 
                    label="Technical Knowledge" 
                    score={categoryScores.technicalKnowledge}
                    description="Understanding of key concepts for the role"
                  />
                  <CategoryScore 
                    label="Problem Solving" 
                    score={categoryScores.problemSolving}
                    description="Ability to analyze problems and propose solutions"
                  />
                  <CategoryScore 
                    label="Cultural & Role Fit" 
                    score={categoryScores.culturalAndRoleFit}
                    description="Alignment with company values and job role"
                  />
                  <CategoryScore 
                    label="Confidence & Clarity" 
                    score={categoryScores.confidenceAndClarity}
                    description="Confidence in responses and engagement"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Question Completion Details</h4>
                <div className="text-sm text-gray-600">
                  <p>Completion Rate: {questionStats.completionRate}</p>
                  <p>Score: {questionStats.completionScore}/10</p>
                  <div className="mt-2">
                    <p>Total Questions: {questionStats.totalQuestions}</p>
                    <p>Correctly Answered: {questionStats.correctCount}</p>
                    <p>Incorrectly Answered: {questionStats.wrongCount}</p>
                    <p>Unattempted: {questionStats.unattemptedCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Final Decision</h4>
                <div className={`flex items-center gap-2 ${color} px-3 py-2 rounded-md inline-block`}>
                  <StatusIcon className={`h-5 w-5 ${iconColor}`} />
                  <span className="font-medium">{status}</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {message}
                </p>
              </div>
            </div>
          )}

          {activeTab === "detailed" && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-3">Key Strengths</h4>
                <ul className="space-y-2">
                  {getFormattedStrengths().length > 0 ? (
                    getFormattedStrengths().map((strength, index) => (
                      <li key={index} className="flex gap-2 items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No specific strengths listed</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-amber-700 mb-3">Areas for Improvement</h4>
                <ul className="space-y-2">
                  {(feedback.areasForImprovement || []).length > 0 ? (
                    feedback.areasForImprovement.map((area, index) => (
                      <li key={index} className="flex gap-2 items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{area}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No specific areas for improvement listed</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Detailed Assessment</h4>
                <div className="space-y-4">
                  <DetailedRemark
                    title="Communication"
                    content={detailedRemarks.communication}
                  />
                  <DetailedRemark
                    title="Technical Knowledge"
                    content={detailedRemarks.technical}
                  />
                  <DetailedRemark
                    title="Problem Solving Approach"
                    content={detailedRemarks.problemSolving}
                  />
                  <DetailedRemark
                    title="Cultural & Team Fit"
                    content={detailedRemarks.cultural}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "solutions" && (
            <div className="space-y-6">
              {questions.length > 0 ? (
                <>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3">Correct Solutions</h4>
                    <div className="space-y-4">
                      {questions.filter(q => q.isCorrect).length > 0 ? (
                        questions.filter(q => q.isCorrect).map((question, index) => (
                          <QuestionCard key={index} question={question} type="correct" />
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No correct solutions found</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-amber-700 mb-3">Areas for Improvement</h4>
                    <div className="space-y-4">
                      {questions.filter(q => !q.isCorrect).length > 0 ? (
                        questions.filter(q => !q.isCorrect).map((question, index) => (
                          <QuestionCard key={index} question={question} type="incorrect" />
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No incorrect solutions found</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading solutions...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">Final Decision</h4>
                <div className="text-gray-800">
                  {status === 'Selected' ? (
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-md inline-block border border-green-200">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="font-medium">Selected - Strong performance across all areas</p>
                    </div>
                  ) : status === 'Waitlisted' ? (
                    <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md inline-block border border-yellow-200">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <p className="font-medium">Waitlisted - Shows potential but needs improvement in key areas</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-2 rounded-md inline-block border border-red-200">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <p className="font-medium">Not Selected - Does not meet required criteria</p>
                    </div>
                  )}
                </div>
              </div>

              {(feedback.topicsToImprove?.wrong?.length || 0) > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Topics to Focus On</h4>
                  <div className="space-y-4">
                    {(feedback.topicsToImprove?.wrong || []).map((topic: string, index: number) => {
                      const topicInfo = topicResources[topic] || getTopicResources(topic);
                      return (
                        <div key={index} className="bg-amber-50 p-4 rounded-lg">
                          <h5 className="font-medium text-amber-800">{topic}</h5>
                          <p className="text-gray-700 text-sm mt-1 mb-2">
                            {topicInfo?.description || `Work on improving your knowledge and skills in ${topic}.`}
                          </p>
                          
                          {topicInfo?.resources && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-600 mb-1">Recommended Resources:</p>
                              <ul className="space-y-1">
                                {topicInfo.resources.map((resource, i) => (
                                  <li key={i} className="text-xs">
                                    <a 
                                      href={resource.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                      {resource.title}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Next Steps</h4>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {status === 'Selected' ? (
                    <p>Consider proceeding to the next interview stage or extending an offer based on the strong performance in this technical assessment.</p>
                  ) : status === 'Waitlisted' ? (
                    <p>Consider an additional technical assessment focusing specifically on areas for improvement before making a final decision.</p>
                  ) : (
                    <p>The candidate does not appear to be a good match for this role at this time. Consider providing constructive feedback and suggesting areas for improvement.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Development Plan</h4>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p>If proceeding with this candidate, consider focusing on these areas for onboarding and development:</p>
                  <ul>
                    {(feedback.topicsToImprove?.wrong?.length || 0) > 0 
                      ? (feedback.topicsToImprove?.wrong || []).map((topic: string, index: number) => (
                          <li key={index}>{topic}</li>
                        ))
                      : (feedback.areasForImprovement || []).slice(0, 3).map((area, index) => (
                          <li key={index}>{area}</li>
                        ))}
                    {(feedback.areasForImprovement || []).length === 0 && (feedback.topicsToImprove?.wrong?.length || 0) === 0 && (
                      <li>Focus on general technical and communication skills development</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4 flex justify-end">
          <Button onClick={onClose} variant="outline" className="mr-2">
            Close
          </Button>
          <Button onClick={downloadFeedback} className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper component for category scores
const CategoryScore = ({ label, score, description }: { label: string; score: number; description: string }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="border rounded-lg p-3">
      <div className="flex justify-between items-center mb-1">
        <h5 className="font-medium text-gray-700">{label}</h5>
        <span className={`font-bold ${getScoreColor(score)}`}>{score}/10</span>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
};

// Helper component for detailed remarks
const DetailedRemark = ({ title, content }: { title: string; content: string }) => {
  return (
    <div className="border rounded-lg p-3">
      <h5 className="font-medium text-gray-700 mb-1">{title}</h5>
      <p className="text-sm text-gray-600">{content}</p>
    </div>
  );
};

// Helper component for question cards
const QuestionCard = ({ question, type }: { question: QuestionItem; type: 'correct' | 'incorrect' }) => {
  const colors = {
    correct: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
      heading: 'text-green-700'
    },
    incorrect: {
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-800',
      heading: 'text-amber-700'
    }
  };

  const colorScheme = colors[type];

  return (
    <div className={`border ${colorScheme.border} rounded-lg overflow-hidden`}>
      <div className={`${colorScheme.bg} p-4`}>
        <div className="flex justify-between items-start">
          <h5 className={`font-medium ${colorScheme.text}`}>{question.topic || 'Unnamed Topic'}</h5>
          <span className={`text-xs ${colorScheme.badge} px-2 py-1 rounded-full`}>
            {type === 'correct' ? 'Correct' : 'Needs Improvement'}
          </span>
        </div>
        <div className="mt-2 text-gray-700">{question.question}</div>
      </div>
      
      <div className={`border-t ${colorScheme.border} p-4`}>
        <h6 className={`font-medium ${colorScheme.heading} mb-2`}>Your Solution:</h6>
        <div className="bg-white p-3 rounded text-gray-800 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
          {question.userAnswer || 'No solution provided'}
        </div>
      </div>
      
      <div className={`border-t ${colorScheme.border} p-4`}>
        <h6 className={`font-medium ${colorScheme.heading} mb-2`}>Expected Answer:</h6>
        <div className="bg-white p-3 rounded text-gray-800 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
          {question.expectedAnswer || 'No expected answer available'}
        </div>
      </div>
      
      <div className={`border-t ${colorScheme.border} p-4`}>
        <h6 className={`font-medium ${colorScheme.heading} mb-2`}>Recommended Approach:</h6>
        <div className="text-sm text-gray-700">
          {question.approach || 'No approach information available'}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;

// Topic resources mapping
const topicResources: { [key: string]: { description: string; resources: { title: string; url: string }[] } } = {
  'Data Structures': {
    description: 'Understanding and implementing efficient data structures is crucial for writing optimized code.',
    resources: [
      { title: 'Data Structures Illustrated', url: 'https://visualgo.net/' },
      { title: 'GeeksforGeeks Data Structures', url: 'https://www.geeksforgeeks.org/data-structures/' },
      { title: 'LeetCode Data Structure Challenges', url: 'https://leetcode.com/explore/learn/' }
    ]
  },
  'Algorithms': {
    description: 'Strong algorithmic thinking helps solve complex problems efficiently.',
    resources: [
      { title: 'Introduction to Algorithms (MIT)', url: 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-006-introduction-to-algorithms-fall-2011/' },
      { title: 'Algorithm Visualizations', url: 'https://visualgo.net/en' },
      { title: 'AlgoExpert', url: 'https://www.algoexpert.io/' }
    ]
  },
  'System Design': {
    description: 'Understanding how to design scalable systems is essential for senior roles.',
    resources: [
      { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
      { title: 'Grokking System Design', url: 'https://www.educative.io/courses/grokking-the-system-design-interview' },
      { title: 'System Design Interview', url: 'https://systeminterview.com/' }
    ]
  },
  'Database Concepts': {
    description: 'Knowledge of database principles ensures efficient data storage and retrieval.',
    resources: [
      { title: 'Database Design Fundamentals', url: 'https://www.pluralsight.com/courses/database-design-fundamentals' },
      { title: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/' },
      { title: 'MongoDB University', url: 'https://university.mongodb.com/' }
    ]
  },
  'Web Development': {
    description: 'Building modern web applications requires understanding various front-end technologies.',
    resources: [
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/' },
      { title: 'Frontend Masters', url: 'https://frontendmasters.com/' },
      { title: 'Full Stack Open', url: 'https://fullstackopen.com/en/' }
    ]
  },
  'Backend Development': {
    description: 'Backend development involves creating APIs and server-side logic.',
    resources: [
      { title: 'Node.js Documentation', url: 'https://nodejs.org/en/docs/' },
      { title: 'RESTful API Design', url: 'https://restfulapi.net/' },
      { title: 'Backend Development Roadmap', url: 'https://roadmap.sh/backend' }
    ]
  },
  'Testing': {
    description: 'Writing tests ensures your code works as expected and prevents regressions.',
    resources: [
      { title: 'Testing JavaScript', url: 'https://testingjavascript.com/' },
      { title: 'Test-Driven Development', url: 'https://www.agilealliance.org/glossary/tdd/' },
      { title: 'Jest Documentation', url: 'https://jestjs.io/docs/getting-started' }
    ]
  },
  'Version Control': {
    description: 'Git and version control systems help teams collaborate on code.',
    resources: [
      { title: 'Git Documentation', url: 'https://git-scm.com/doc' },
      { title: 'Learn Git Branching', url: 'https://learngitbranching.js.org/' },
      { title: 'GitHub Learning Lab', url: 'https://lab.github.com/' }
    ]
  },
  'Computer Science Fundamentals': {
    description: 'Understanding CS principles helps in solving complex technical problems.',
    resources: [
      { title: 'CS50 (Harvard)', url: 'https://cs50.harvard.edu/x/2022/' },
      { title: 'Big-O Cheat Sheet', url: 'https://www.bigocheatsheet.com/' },
      { title: 'Teach Yourself CS', url: 'https://teachyourselfcs.com/' }
    ]
  },
  'Security': {
    description: 'Understanding security concepts protects applications from vulnerabilities.',
    resources: [
      { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' },
      { title: 'Web Security Academy', url: 'https://portswigger.net/web-security' },
      { title: 'MDN Web Security', url: 'https://developer.mozilla.org/en-US/docs/Web/Security' }
    ]
  }
};

// Helper function to generate topic resources for topics not in predefined list
const getTopicResources = (topic: string): { description: string; resources: { title: string; url: string }[] } => {
  const description = `Improving your knowledge in ${topic} will enhance your problem-solving abilities and technical skills.`;
  
  const defaultResources = [
    { title: 'LeetCode Problems', url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(topic)}` },
    { title: 'GeeksforGeeks Articles', url: `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(topic)}` }
  ];
  
  const resources = [...defaultResources];
  
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('array') || topicLower.includes('string') || topicLower.includes('hash')) {
    resources.push({ 
      title: 'Data Structures Practice', 
      url: 'https://www.hackerrank.com/domains/data-structures' 
    });
  }
  
  if (topicLower.includes('dynamic') || topicLower.includes('recursion')) {
    resources.push({ 
      title: 'Dynamic Programming Patterns', 
      url: 'https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns' 
    });
  }
  
  if (topicLower.includes('tree') || topicLower.includes('graph')) {
    resources.push({ 
      title: 'Tree & Graph Visualizations', 
      url: 'https://visualgo.net/en/graphds' 
    });
  }
  
  if (topicLower.includes('sort') || topicLower.includes('search')) {
    resources.push({ 
      title: 'Sorting Algorithms Visualized', 
      url: 'https://visualgo.net/en/sorting' 
    });
  }
  
  return {
    description,
    resources
  };
}; 