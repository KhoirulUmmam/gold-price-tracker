import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatters";

const PriceHistory = () => {
  const [timeframe, setTimeframe] = useState("7d");
  const [chartType, setChartType] = useState("line");
  
  // Fetch gold price history data
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['/api/gold-prices/history', timeframe],
  });
  
  const handleExportCSV = () => {
    // Implementation for exporting data as CSV
  };
  
  const handleExportPDF = () => {
    // Implementation for exporting data as PDF
  };
  
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">Price History</h1>
          <p className="text-gray-500">Historical gold price data from Pegadaian</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              Export PDF
            </Button>
          </div>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gold Price Trends</CardTitle>
            <Tabs value={chartType} onValueChange={setChartType} className="w-auto">
              <TabsList>
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
                <TabsTrigger value="candlestick">Candlestick</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <div className="h-full">
                {/* Chart will be rendered here */}
                <p className="text-center text-gray-500">Chart visualization based on selected options</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Historical Price Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b pb-2 text-left">Date</th>
                  <th className="border-b pb-2 text-left">Buy Price</th>
                  <th className="border-b pb-2 text-left">Sell Price</th>
                  <th className="border-b pb-2 text-left">Price Per Gram</th>
                  <th className="border-b pb-2 text-left">Daily Change</th>
                  <th className="border-b pb-2 text-left">Change %</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">Loading data...</td>
                  </tr>
                ) : historyData && historyData.length > 0 ? (
                  historyData.map((item, index) => (
                    <tr key={item.id}>
                      <td className="py-2 border-b">{format(new Date(item.date), 'MMM dd, yyyy')}</td>
                      <td className="py-2 border-b">{formatCurrency(item.buyPrice)}</td>
                      <td className="py-2 border-b">{formatCurrency(item.sellPrice)}</td>
                      <td className="py-2 border-b">{formatCurrency(item.pricePerGram)}</td>
                      <td className={`py-2 border-b ${item.dailyChange > 0 ? 'text-[hsl(var(--increase))]' : item.dailyChange < 0 ? 'text-[hsl(var(--decrease))]' : ''}`}>
                        {item.dailyChange > 0 ? `+${formatCurrency(item.dailyChange)}` : formatCurrency(item.dailyChange)}
                      </td>
                      <td className={`py-2 border-b ${item.changePercent > 0 ? 'text-[hsl(var(--increase))]' : item.changePercent < 0 ? 'text-[hsl(var(--decrease))]' : ''}`}>
                        {item.changePercent > 0 ? `+${item.changePercent.toFixed(2)}%` : `${item.changePercent.toFixed(2)}%`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4">No historical data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PriceHistory;
