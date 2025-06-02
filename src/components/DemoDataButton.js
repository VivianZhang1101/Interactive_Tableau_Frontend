import React, { useState } from 'react';
import { Database, Loader } from 'lucide-react';

function DemoDataButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDemo = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('⚠️ This will clear all existing data and generate fresh demo data.\n\nThis action cannot be undone. Continue?')) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/demo-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to generate demo data');
      // Simulate a delay to allow backend processing
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      window.location.reload(); // Reload the page to reflect changes
      
      alert('✅ Demo data generated successfully! All tables have been reset.');
    } catch (error) {
      console.error('Failed to generate demo data:', error);
      alert('❌ Failed to generate demo data. Please try again.');
    } 
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGenerateDemo}
        disabled={isGenerating}
        className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isGenerating
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md'
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center gap-2">
            <Loader className="w-3 h-3 animate-spin" />
            Generating...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Database className="w-3 h-3" />
            Reset Demo Data
          </div>
        )}
      </button>

      {/* Full Screen Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800">Generating Demo Data</h3>
              <p className="text-gray-600">Please wait while we reset all tables and refreshing dashboard...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DemoDataButton;