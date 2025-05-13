import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";

const ProfitAnalytics = () => {
  const [timeframe, setTimeframe] = useState("1m");
  
  // Fetch investment data
  const { data: investments, isLoading: investmentsLoading } = useQuery({
    queryKey: ['/api/investments'],
  });
  
  // Fetch gold price history
  const { data: priceHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/gold-prices/history', timeframe],
  });
  
  // Calculate profit metrics
  const calculateMetrics = () => {
    if (!investments || !priceHistory || investments.length === 0 || priceHistory.length === 0) {
      return {
        totalInvestment: 0,
        currentValue: 0,
        totalProfit: 0,
        profitPercentage: 0,
        annualizedReturn: 0,
        bestPerforming: null,
        worstPerforming: null,
        volatility: 0
      };
    }
    
    // Get current price
    const currentPrice = priceHistory[0].pricePerGram;
    
    // Calculate total investment and current value
    const totalInvestment = investments.reduce((sum, inv) => sum + parseFloat(inv.purchasePrice), 0);
    const totalWeight = investments.reduce((sum, inv) => sum + parseFloat(inv.weight), 0);
    const currentValue = totalWeight * parseFloat(currentPrice);
    
    // Calculate profit metrics
    const totalProfit = currentValue - totalInvestment;
    const profitPercentage = (totalProfit / totalInvestment) * 100;
    
    // Calculate annualized return
    // Get the oldest investment date
    const oldestInvestment = investments.reduce((oldest, inv) => {
      const invDate = new Date(inv.purchaseDate);
      const oldestDate = oldest ? new Date(oldest.purchaseDate) : null;
      return !oldestDate || invDate < oldestDate ? inv : oldest;
    }, null);
    
    const daysHeld = oldestInvestment ? 
      (new Date().getTime() - new Date(oldestInvestment.purchaseDate).getTime()) / (1000 * 60 * 60 * 24) : 
      0;
    
    const annualizedReturn = daysHeld > 0 ? 
      (Math.pow((1 + profitPercentage / 100), (365 / daysHeld)) - 1) * 100 : 
      0;
    
    // Calculate best and worst performing investments
    let bestPerforming = null;
    let worstPerforming = null;
    
    if (investments.length > 0) {
      const performanceData = investments.map(inv => {
        const invWeight = parseFloat(inv.weight);
        const invPurchasePrice = parseFloat(inv.purchasePrice);
        const invCurrentValue = invWeight * parseFloat(currentPrice);
        const invProfit = invCurrentValue - invPurchasePrice;
        const invProfitPercentage = (invProfit / invPurchasePrice) * 100;
        
        return {
          ...inv,
          currentValue: invCurrentValue,
          profit: invProfit,
          profitPercentage: invProfitPercentage
        };
      });
      
      bestPerforming = performanceData.reduce((best, inv) => {
        return !best || inv.profitPercentage > best.profitPercentage ? inv : best;
      }, null);
      
      worstPerforming = performanceData.reduce((worst, inv) => {
        return !worst || inv.profitPercentage < worst.profitPercentage ? inv : worst;
      }, null);
    }
    
    // Calculate price volatility (standard deviation of daily returns)
    let volatility = 0;
    if (priceHistory.length > 1) {
      const dailyReturns = [];
      for (let i = 1; i < priceHistory.length; i++) {
        const todayPrice = parseFloat(priceHistory[i-1].pricePerGram);
        const yesterdayPrice = parseFloat(priceHistory[i].pricePerGram);
        const dailyReturn = (todayPrice - yesterdayPrice) / yesterdayPrice;
        dailyReturns.push(dailyReturn);
      }
      
      const meanReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
      const squaredDeviations = dailyReturns.map(ret => Math.pow(ret - meanReturn, 2));
      const variance = squaredDeviations.reduce((sum, sqDev) => sum + sqDev, 0) / squaredDeviations.length;
      volatility = Math.sqrt(variance) * 100; // Convert to percentage
    }
    
    return {
      totalInvestment,
      currentValue,
      totalProfit,
      profitPercentage,
      annualizedReturn,
      bestPerforming,
      worstPerforming,
      volatility
    };
  };
  
  const metrics = calculateMetrics();
  const isLoading = investmentsLoading || historyLoading;
  
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">Profit Analytics</h1>
          <p className="text-gray-500">Detailed analysis of your gold investment performance</p>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
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
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Total Profit</div>
            <div className={`text-2xl font-bold mt-1 ${metrics.totalProfit >= 0 ? 'text-[hsl(var(--increase))]' : 'text-[hsl(var(--decrease))]'}`}>
              {isLoading ? 'Loading...' : `${metrics.totalProfit >= 0 ? '+' : ''}${formatCurrency(metrics.totalProfit)}`}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {isLoading ? '' : `${metrics.profitPercentage >= 0 ? '+' : ''}${metrics.profitPercentage.toFixed(2)}% overall`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Annualized Return</div>
            <div className={`text-2xl font-bold mt-1 ${metrics.annualizedReturn >= 0 ? 'text-[hsl(var(--increase))]' : 'text-[hsl(var(--decrease))]'}`}>
              {isLoading ? 'Loading...' : `${metrics.annualizedReturn >= 0 ? '+' : ''}${metrics.annualizedReturn.toFixed(2)}%`}
            </div>
            <div className="text-xs text-gray-500 mt-1">Per year</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Best Performing</div>
            <div className="text-2xl font-bold mt-1 text-[hsl(var(--increase))]">
              {isLoading ? 'Loading...' : 
                metrics.bestPerforming ? 
                  `+${metrics.bestPerforming.profitPercentage.toFixed(2)}%` : 
                  'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.bestPerforming ? 
                `${parseFloat(metrics.bestPerforming.weight).toFixed(1)}g purchased` : 
                'No investments'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Price Volatility</div>
            <div className="text-2xl font-bold mt-1">
              {isLoading ? 'Loading...' : `${metrics.volatility.toFixed(2)}%`}
            </div>
            <div className="text-xs text-gray-500 mt-1">Standard deviation</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Chart</CardTitle>
            <CardDescription>Visualization of your investment performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              {isLoading ? (
                <p>Loading chart data...</p>
              ) : investments && investments.length > 0 ? (
                <p className="text-center text-gray-500">
                  Performance chart visualization
                  {/* Chart would be implemented here */}
                </p>
              ) : (
                <p className="text-center text-gray-500">No investment data available</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Value Distribution</CardTitle>
            <CardDescription>How your gold investments are distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              {isLoading ? (
                <p>Loading chart data...</p>
              ) : investments && investments.length > 0 ? (
                <p className="text-center text-gray-500">
                  Value distribution chart
                  {/* Chart would be implemented here */}
                </p>
              ) : (
                <p className="text-center text-gray-500">No investment data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gold Price vs. Other Investments</CardTitle>
          <CardDescription>Comparing gold performance with other assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-center justify-center">
            {isLoading ? (
              <p>Loading comparison data...</p>
            ) : (
              <p className="text-center text-gray-500">
                Comparison chart between gold and other investments
                {/* Chart would be implemented here */}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
              <div className="text-center">
                <span className="text-sm text-gray-500">Gold ({timeframe})</span>
                <div className="text-xl font-bold text-[hsl(var(--gold))]">+4.8%</div>
              </div>
            </div>
            <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
              <div className="text-center">
                <span className="text-sm text-gray-500">Stocks ({timeframe})</span>
                <div className="text-xl font-bold text-[hsl(var(--primary))]">+2.1%</div>
              </div>
            </div>
            <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
              <div className="text-center">
                <span className="text-sm text-gray-500">Inflation ({timeframe})</span>
                <div className="text-xl font-bold text-[hsl(var(--decrease))]">+3.2%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ProfitAnalytics;
