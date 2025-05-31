import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { tab } from '@testing-library/user-event/dist/tab';

function TableauVizEmbed({ tableauUrl, refreshTrigger }) {
  const containerRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Default URL - replace with your actual Tableau URL
  const defaultUrl = tableauUrl || 'https://us-east-1.online.tableau.com/t/wenxinzhang2025-e6af3a9f9e/views/GoogleBigQueryLiveInventoryDashboard/InventoryRestockingDashboard';

  // Initialize Tableau embed
  useEffect(() => {
    if (!containerRef.current) return;

    const initTableau = () => {
      try {
        // Create tableau-viz element
        const viz = document.createElement('tableau-viz');
        viz.setAttribute('src', defaultUrl);
        viz.setAttribute('width', '100%');
        viz.setAttribute('height', '800');
        viz.setAttribute('toolbar', 'bottom');

        // Clear container and add viz
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(viz);
        
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Failed to initialize Tableau:', error);
        // Fallback to placeholder
        containerRef.current.innerHTML = `
          <div class="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <div class="text-4xl mb-2">📊</div>
              <p>Tableau Dashboard Loading...</p>
              <p class="text-sm mt-1">If this persists, check your Tableau URL</p>
            </div>
          </div>
        `;
      }
    };

    initTableau();
  }, [defaultUrl]);

  // Handle refresh trigger from parent
  useEffect(() => {
    if (refreshTrigger) {
      handleRefreshTableau();
    }
  }, [refreshTrigger]);

  const handleRefreshTableau = async () => {
    setIsRefreshing(true);
    
    try {
      // Method 1: Try to refresh existing Tableau embed
      const vizElements = containerRef.current?.querySelectorAll('tableau-viz');
      if (vizElements && vizElements.length > 0) {
        // Try calling refresh method if available
        if (typeof vizElements[0].refresh === 'function') {
          await vizElements[0].refresh();
        } else {
          // Method 2: Reload the embed
          const viz = vizElements[0];
          const src = viz.getAttribute('src');
          viz.setAttribute('src', '');
          setTimeout(() => viz.setAttribute('src', src), 100);
        }
      } else {
        // Method 3: Recreate the entire embed
        const viz = document.createElement('tableau-viz');
        viz.setAttribute('src', defaultUrl);
        viz.setAttribute('width', '100%');
        viz.setAttribute('height', '850');
        viz.setAttribute('toolbar', 'bottom');

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(viz);
      }
      
      setLastRefresh(new Date());
      
      // Provide user feedback
      setTimeout(() => {
        setIsRefreshing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Tableau refresh failed:', error);
      setIsRefreshing(false);
      
      // Show user-friendly message
      alert('Dashboard refresh attempted. If data doesn\'t update, please manually refresh your browser (F5 or Ctrl+R).');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl">📊</div>
          <h2 className="text-xl font-semibold text-gray-800">Inventory Dashboard</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {lastRefresh && (
            <span className="text-sm text-gray-500">
              Updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={handleRefreshTableau}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              isRefreshing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Dashboard'}
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-gray-50">
        {/* Tableau Container */}
        <div 
          ref={containerRef}
          className="w-full min-h-[600px]"
        >
          {/* Loading placeholder */}
          <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>Loading Tableau Dashboard...</p>
              <p className="text-sm mt-1">Please wait while the dashboard initializes</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Helper Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
        <p className="font-medium mb-1">💡 Dashboard Tips:</p>
        <ul className="space-y-1 text-blue-600">
          <li>• Click "Refresh Dashboard" after submitting new requests</li>
          <li>• If auto-refresh doesn't work, manually refresh your browser (F5)</li>
          <li>• Data updates may take 5-10 seconds to appear in Tableau</li>
        </ul>
      </div>
    </div>
  );
}

export default TableauVizEmbed;