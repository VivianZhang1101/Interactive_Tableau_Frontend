import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, ChevronUp, ChevronDown} from 'lucide-react';

function TableauVizEmbed({ tableauUrl, tableauRefreshTrigger }) {
  const containerRef = useRef(null);
  const vizRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [showTips, setShowTips] = useState(false);

  const defaultUrl = tableauUrl || 'https://us-east-1.online.tableau.com/t/wenxinzhang2025-e6af3a9f9e/views/GoogleBigQueryLiveInventoryDashboard/InventoryRestockingDashboard';

  // Initialize Tableau with v3 API
  useEffect(() => {
    if (!containerRef.current) return;

    const initTableau = () => {
      try {
        // Create tableau-viz element
        const viz = document.createElement('tableau-viz');
        viz.setAttribute('src', defaultUrl);
        viz.setAttribute('width', '100%');
        viz.setAttribute('height', '600');
        viz.setAttribute('toolbar', 'bottom');

        // Store reference for later use
        vizRef.current = viz;
        
        // Clear container and add viz
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(viz);
        
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Failed to initialize Tableau:', error);
      }
    };

    initTableau();
  }, [defaultUrl]);


  const handleRefreshTableau = useCallback(async () => {
    if (!vizRef.current) return;
    
    setIsRefreshing(true);
    
    try {
      // Use v3 API method to refresh data
      await vizRef.current.refreshDataAsync();
      setLastRefresh(new Date());
      
      setTimeout(() => {
        setIsRefreshing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Tableau refresh failed:', error);
      // Fallback: recreate the viz if refresh fails
      try {
        const viz = document.createElement('tableau-viz');
        viz.setAttribute('src', defaultUrl);
        viz.setAttribute('width', '100%');
        viz.setAttribute('height', '600');
        viz.setAttribute('toolbar', 'bottom');

        vizRef.current = viz;
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(viz);
        setLastRefresh(new Date());
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
      }
      
      setIsRefreshing(false);
    }
  }, [defaultUrl]);
  // Handle refresh trigger from parent
  useEffect(() => {
    if (tableauRefreshTrigger) {
      handleRefreshTableau();
    }
  }, [tableauRefreshTrigger, handleRefreshTableau]);
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
        <div 
          ref={containerRef}
          className="w-full"
          style={{ height: '600px' }}
        />
      </div>
      
      {/* Keep your existing tips section */}
      <div className="mt-3">
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span className="text-lg">💡</span>
          <span className="font-medium">Dashboard Tips</span>
          {showTips ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {showTips && (
          <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
            <div className="text-blue-700 space-y-1">
              <p>• <span className="font-medium">Auto-refresh:</span> Dashboard refreshes automatically after submitting requests</p>
              <p>• <span className="font-medium">Manual refresh:</span> Click "Refresh Dashboard" button for immediate update</p>
              <p>• <span className="font-medium">Data timing:</span> Updates may take 5-10 seconds to appear in Tableau</p>
              <p>• <span className="font-medium">Troubleshooting:</span> If data doesn't update, refresh your browser (F5)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableauVizEmbed;