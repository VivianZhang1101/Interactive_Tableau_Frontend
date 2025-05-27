import React from 'react';
import { useEffect, useRef } from 'react';

function TableauVizEmbed() {
  const containerRef = useRef(null);

  useEffect(() => {
    const viz = document.createElement('tableau-viz');
    viz.setAttribute(
      'src',
      'https://us-east-1.online.tableau.com/t/wenxinzhang2025-e6af3a9f9e/views/GoogleBigQueryLiveInventoryDashboard/Dashboard1'
    );
    viz.setAttribute('width', '100%');
    viz.setAttribute('height', '850');
    viz.setAttribute('toolbar', 'bottom');

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(viz);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📊 Embedded Tableau Dashboard</h1>
      <div ref={containerRef}></div>
    </div>
  );
}
export default TableauVizEmbed;