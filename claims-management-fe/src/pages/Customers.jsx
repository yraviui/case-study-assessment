import React, { useState, useEffect, lazy, Suspense } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import ReportUpdates from '../components/ReportUpdates';

// Lazy load the CustomerTable component bundle asset
const CustomerTable = lazy(() => import('../components/CustomerTable'));

// ✨ Component 1: Visual Skeleton Loader
const TableSkeleton = () => (
  <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-sm animate-pulse">
    <div className="h-8 bg-gray-100 rounded-xl w-1/4 mb-6"></div>
    <div className="space-y-4">
      <div className="h-12 bg-gray-50 rounded-xl w-full"></div>
      <div className="h-16 bg-gray-50/50 rounded-xl w-full"></div>
      <div className="h-16 bg-gray-50/50 rounded-xl w-full"></div>
      <div className="h-16 bg-gray-50/50 rounded-xl w-full"></div>
    </div>
  </div>
);

// ✨ Component 2: Data Loading Spinner
const DataSpinnerLoader = () => (
  <div className="w-full rounded-3xl border border-gray-100 bg-white p-20 shadow-sm flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    <p className="text-sm font-medium text-gray-500 tracking-wide">Syncing Customer Records...</p>
  </div>
);

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  // ✨ Added an error state to handle server drops or connection failures gracefully
  const [error, setError] = useState(null);

  useEffect(() => {
    // AbortController cleans up incomplete network threads if the user navigates away mid-request
    const controller = new AbortController();
    
    const fetchCustomers = async () => {
      try {
        setIsLoadingData(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/customers`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // ✨ NOTE: Based on your API configuration, your server drops either an object or a direct array. 
        // We evaluate both formats safely using this fallback syntax:
        const incomingList = data?.initialCustomers || data || [];
        setCustomers(incomingList);
        
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Failed fetching records:", err);
          setError(err.message || "Failed to load customers.");
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchCustomers();

    return () => controller.abort();
  }, []);

  return (
    <div className="flex flex-col gap-6 lg:gap-8 min-h-full w-full">
      <DashboardHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className='w-full overflow-hidden'>
        This page for JSON APi call of 20K records
      </div>
      
      <div className='w-full overflow-hidden'>
        <ReportUpdates customers={customers} />
      </div>
      
      <div className='w-full flex-1'>
        <Suspense fallback={<TableSkeleton />}>
          {isLoadingData ? (
            <DataSpinnerLoader />
          ) : error ? (
            /* ✨ Fallback error display container */
            <div className="w-full rounded-3xl border border-red-100 bg-red-50/50 p-8 text-center text-sm font-medium text-red-600">
              {error}. Please verify your server connection port details.
            </div>
          ) : (
            <CustomerTable 
              customers={customers} 
              setCustomers={setCustomers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default Customers;
