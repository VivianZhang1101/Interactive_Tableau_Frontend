import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, RefreshCw, Trash2, Clock, Loader } from "lucide-react";

function RestockHistory({ refreshTrigger, onRequestDeleted }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [deletingIds, setDeletingIds] = useState(new Set());
  // Auto-refresh every 60 seconds when expanded
  useEffect(() => {
    if (!isExpanded) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/restock-history");
        if (!response.ok) throw new Error("Failed to fetch history");
        const data = await response.json();
        setHistory(data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [isExpanded]);

  // Refresh when triggered by parent
  useEffect(() => {
    if (refreshTrigger && isExpanded) {
      handleRefresh();
    }
  }, [refreshTrigger, isExpanded]);

  const handleUndo = async (requestId, productName, requestedBy) => {
    // eslint-disable-next-line no-restricted-globals
    if (
      // eslint-disable-next-line no-restricted-globals
      !confirm(`Delete restock request for ${productName} by ${requestedBy}?`)
    )
      return;
    setDeletingIds((prev) => new Set(prev).add(requestId));
    try {
      const response = await fetch(`/api/restock-request/${requestId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete request");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Remove from local state
      setHistory((prev) =>
        prev.filter((item) => item.request_id !== requestId)
      );
      // Trigger dashboard refresh
      if (onRequestDeleted) {
        onRequestDeleted();
      }

      alert(`Request for ${productName} by ${requestedBy} has been deleted.`);
    } catch (error) {
      console.error("Failed to delete request:", error);
      alert("Failed to delete request");
    } finally {
      // Remove from deleting set
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/restock-history");
      if (!response.ok) throw new Error("Failed to refresh history");
      const data = await response.json();
      setHistory(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="text-lg">📋</div>
          <span className="font-medium text-gray-800">
            Show History ({history.length} requests)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t px-6 pb-6">
          <div className="flex items-center justify-between py-4">
            <h3 className="font-medium text-gray-800">
              Recent Restock Requests
            </h3>
            <div className="flex items-center gap-4">
              {lastUpdate && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  Updated {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-700">
                    Timestamp
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Product
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Qty
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Requested By
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((request) => (
                  <tr
                    key={request.request_id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3 text-gray-600">{request.timestamp}</td>
                    <td className="p-3 font-medium">{request.product_name}</td>
                    <td className="p-3">{request.quantity}</td>
                    <td className="p-3">{request.requested_by_name}</td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          handleUndo(
                            request.request_id,
                            request.product_name,
                            request.requested_by_name
                          )
                        }
                        disabled={deletingIds.has(request.request_id)}
                        className={`flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-md text-sm transition-colors ${
                          deletingIds.has(request.request_id)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {deletingIds.has(request.request_id) ? (
                          <>
                            <Loader className="w-3 h-3 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3" />
                            Undo
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {history.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                No restock requests found
              </div>
            )}

            {isLoading && (
              <div className="text-center py-8 text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading history...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RestockHistory;
