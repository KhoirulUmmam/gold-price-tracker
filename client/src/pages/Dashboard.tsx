import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PriceCards from "@/components/dashboard/PriceCards";
import PriceChart from "@/components/dashboard/PriceChart";
import GoldCalculator from "@/components/dashboard/GoldCalculator";
import PriceAlerts from "@/components/dashboard/PriceAlerts";
import RecentChanges from "@/components/dashboard/RecentChanges";
import InvestmentPerformance from "@/components/dashboard/InvestmentPerformance";
import { formatDateTime } from "@/lib/formatters";

const Dashboard = () => {
  const [refreshInterval, setRefreshInterval] = useState("daily");
  
  // Fetch current gold price data
  const { data: goldData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/gold-prices/current'],
  });
  
  // Format the last updated time
  const lastUpdatedTime = goldData ? formatDateTime(goldData.date) : 'Loading...';
  
  const handleRefresh = () => {
    refetch();
  };
  
  // Set up automatic refresh based on user preference
  useEffect(() => {
    let intervalId;
    
    if (refreshInterval === "hourly") {
      intervalId = setInterval(() => {
        refetch();
      }, 60 * 60 * 1000); // 1 hour
    } else if (refreshInterval === "realtime") {
      intervalId = setInterval(() => {
        refetch();
      }, 5 * 60 * 1000); // 5 minutes
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [refreshInterval, refetch]);
  
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Last updated: {lastUpdatedTime}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <div className="relative">
            <select 
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[hsl(var(--primary-light))] focus:border-[hsl(var(--primary-light))] sm:text-sm rounded-md bg-white shadow-sm"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
            >
              <option value="daily">Daily Updates</option>
              <option value="hourly">Hourly Updates</option>
              <option value="realtime">Real-time Updates</option>
            </select>
          </div>
          <button 
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-light))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary-light))] transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* Price Overview Cards */}
      <PriceCards data={goldData} isLoading={isLoading} />
      
      {/* Price Chart and Gold Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PriceChart />
        <GoldCalculator currentPrice={goldData?.buyPrice} />
      </div>
      
      {/* Price Notifications & Recent Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PriceAlerts />
        <RecentChanges />
      </div>
      
      {/* Investment Performance */}
      <InvestmentPerformance />
    </>
  );
};

export default Dashboard;
