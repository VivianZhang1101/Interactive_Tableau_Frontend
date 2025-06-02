import React, { useState } from 'react';
import RestockForm from './components/RestockForm';
import TableauVizEmbed from './components/TableauVizEmbed';
import RestockHistory from './components/RestockHistory';
import DemoDataButton from './components/DemoDataButton';
import { Settings } from 'lucide-react';

function App() {
  // State to trigger refreshes across components
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tableauRefreshTrigger, setTableauRefreshTrigger] = useState(0);

  // Handle when a new request is submitted
  const handleRequestSubmitted = () => {
    // Trigger refresh in history and tableau components
    setRefreshTrigger(prev => prev + 1);
    setTableauRefreshTrigger(prev => prev + 1);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[1500px] mx-auto p-6">
        {/* Header with Admin Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Inventory Management System
            </h1>
            <p className="text-gray-600">
              Submit restock requests and monitor inventory levels in real-time
            </p>
          </div>
          
          {/* Admin Controls */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Admin Controls</span>
            </div>
            <DemoDataButton />
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Form Only */}
          <div className="lg:col-span-1">
            <RestockForm onRequestSubmitted={handleRequestSubmitted} />
          </div>
          
          {/* Right Column - Dashboard and History */}
          <div className="lg:col-span-3 space-y-6">
            {/* Dashboard on Top */}
            <TableauVizEmbed 
              tableauRefreshTrigger={tableauRefreshTrigger}
              tableauUrl="https://us-east-1.online.tableau.com/t/wenxinzhang2025-e6af3a9f9e/views/GoogleBigQueryLiveInventoryDashboard/InventoryRestockingDashboard"
            />
            
            {/* History Underneath */}
            <RestockHistory refreshTrigger={refreshTrigger} onRequestDeleted={handleRequestSubmitted}  />
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Enterprise Inventory Management • Built with React + FastAPI + BigQuery + Tableau</p>
        </div>
      </div>
    </div>
  );
}

export default App;