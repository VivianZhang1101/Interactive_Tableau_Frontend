import React, { useState } from 'react';
import { Database, Loader } from 'lucide-react';

function DemoDataButton({ onDemoDataGenerated }) {
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
      
      
      // Notify parent component
      if (onDemoDataGenerated) {
        onDemoDataGenerated();
      }
      
      alert('✅ Demo data generated successfully! All tables have been reset.');
    } catch (error) {
      console.error('Failed to generate demo data:', error);
      alert('❌ Failed to generate demo data. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
  );
}

export default DemoDataButton;