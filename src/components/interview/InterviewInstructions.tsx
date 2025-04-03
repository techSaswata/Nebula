import React from 'react';

interface InterviewInstructionsProps {
  onNext: () => void;
}

export default function InterviewInstructions({ onNext }: InterviewInstructionsProps) {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold">AcademiX</span>
          {/* <div className="flex items-center gap-2 bg-neutral-900 rounded px-3 py-1"> */}
            {/* <span></span> */}
            <span className="bg-red-600 text-xs px-2 py-0.5 rounded">Proctored</span>
          {/* </div> */}
        </div>
        <div className="w-8 h-8 rounded-full bg-purple-600" /> {/* Profile placeholder */}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-medium mb-6">Interview Instructions</h1>
        
        <div className="bg-neutral-900 rounded-lg p-6 space-y-6">
          {/* Time and Proctored Environment */}
          <section>
            <h2 className="font-medium mb-3">Time and Proctored Environment</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>This is a TIMED and PROCTORED mock interview.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Please keep track of the time remaining at the top of the page. It will appear after you have started the interview.</span>
              </li>
            </ul>
          </section>

          {/* Video and Full Screen Requirements */}
          <section>
            <h2 className="font-medium mb-3">Video and Full Screen Requirements</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span><span className="font-medium">Video must remain ON</span> throughout the interview. Turning it off is not permitted.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Upon entering the interview, you will automatically enter <span className="font-medium">full-screen mode</span>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Exiting full-screen mode without re-entering within <span className="font-medium">10 seconds</span> will result in disqualification.</span>
              </li>
            </ul>
          </section>

          {/* Prohibited Actions */}
          <section>
            <h2 className="font-medium mb-3">Prohibited Actions</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>To maintain the integrity of the interview, the following actions are strictly prohibited:</span>
              </li>
              <div className="bg-neutral-800 rounded p-4 ml-4 mt-2">
                <ul className="space-y-2">
                  <li>• Switching Tabs</li>
                  <li>• Closing the session tab</li>
                  <li>• Opening inspector</li>
                  <li>• Right Click</li>
                  <li>• Selecting the text</li>
                  <li>• Exiting the Full-Screen Mode</li>
                </ul>
              </div>
            </ul>
          </section>

          {/* Disqualification Policy */}
          <section>
            <h2 className="font-medium mb-3">Disqualification Policy</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Exiting the session tab or browser during the interview will result in <span className="font-medium">immediate disqualification</span>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Any violation of the prohibited actions (e.g., switching tabs, attempting to copy-paste, or exiting full-screen mode) will also lead to disqualification.</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Checkbox and Next Button */}
        <div className="mt-6 space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded bg-neutral-800 border-neutral-700" />
            <span>I have read the instructions and agree to follow them. I understand that not following them may result in disqualification.</span>
          </label>
          <button
            onClick={onNext}
            className="bg-neutral-800 text-white px-6 py-2 rounded hover:bg-neutral-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
} 