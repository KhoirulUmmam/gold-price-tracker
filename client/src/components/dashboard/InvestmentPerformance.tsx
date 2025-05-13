import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

const InvestmentPerformance = () => {
  // Fetch investments
  const { data: investments, isLoading: investmentsLoading } = useQuery({
    queryKey: ['/api/investments'],
  });
  
  // Fetch current gold price
  const { data: currentPriceData, isLoading: priceLoading } = useQuery({
    queryKey: ['/api/gold-prices/current'],
  });
  
  const isLoading = investmentsLoading || priceLoading;
  
  // Calculate investment metrics
  const calculateMetrics = () => {
    if (!investments || !currentPriceData) {
      return {
        totalInvestment: 0,
        totalWeight: 0,
        currentValue: 0,
        totalProfit: 0,
        profitPercentage: 0,
        profitIfSold: 0
      };
    }
    
    const totalInvestment = investments.reduce((sum, inv) => sum + parseFloat(inv.purchasePrice), 0);
    const totalWeight = investments.reduce((sum, inv) => sum + parseFloat(inv.weight), 0);
    
    // Calculate current value based on current price per gram
    const currentValue = totalWeight * parseFloat(currentPriceData.pricePerGram);
    
    // Calculate profit
    const totalProfit = currentValue - totalInvestment;
    const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
    
    // Calculate profit if sold (using sell price)
    const sellValue = totalWeight * parseFloat(currentPriceData.sellPrice);
    const profitIfSold = sellValue - totalInvestment;
    
    return {
      totalInvestment,
      totalWeight,
      currentValue,
      totalProfit,
      profitPercentage,
      profitIfSold
    };
  };
  
  const metrics = calculateMetrics();
  
  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Your Investment Performance</h2>
        </div>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // No investments yet
  if (!investments || investments.length === 0) {
    return (
      <Card className="bg-white rounded-xl shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Your Investment Performance</h2>
        </div>
        <CardContent className="p-5">
          <div className="text-center py-10">
            <h3 className="text-xl font-semibold mb-2">No investments yet</h3>
            <p className="text-gray-500 mb-6">Start tracking your gold investments to see performance metrics</p>
            <Link href="/my-investments">
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add First Investment
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white rounded-xl shadow-sm mb-6">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Your Investment Performance</h2>
      </div>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[hsl(var(--muted))] rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Investment</div>
            <div className="text-xl font-bold mt-1">{formatCurrency(metrics.totalInvestment)}</div>
            <div className="text-xs text-gray-500 mt-1">{metrics.totalWeight.toFixed(1)} grams</div>
          </div>
          
          <div className="bg-[hsl(var(--muted))] rounded-lg p-4">
            <div className="text-sm text-gray-500">Current Value</div>
            <div className="text-xl font-bold mt-1">{formatCurrency(metrics.currentValue)}</div>
            <div className="text-xs text-gray-500 mt-1">Based on current price</div>
          </div>
          
          <div className="bg-[hsl(var(--muted))] rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Profit</div>
            <div className={`text-xl font-bold mt-1 ${metrics.totalProfit >= 0 ? 'text-[hsl(var(--increase))]' : 'text-[hsl(var(--decrease))]'}`}>
              {metrics.totalProfit >= 0 ? '+' : ''}{formatCurrency(metrics.totalProfit)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.profitPercentage >= 0 ? '+' : ''}{metrics.profitPercentage.toFixed(2)}% ROI
            </div>
          </div>
          
          <div className="bg-[hsl(var(--muted))] rounded-lg p-4">
            <div className="text-sm text-gray-500">Profit if Sold Today</div>
            <div className={`text-xl font-bold mt-1 ${metrics.profitIfSold >= 0 ? 'text-[hsl(var(--increase))]' : 'text-[hsl(var(--decrease))]'}`}>
              {metrics.profitIfSold >= 0 ? '+' : ''}{formatCurrency(metrics.profitIfSold)}
            </div>
            <div className="text-xs text-gray-500 mt-1">After fees & taxes</div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (g)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investments.map((investment) => {
                const weight = parseFloat(investment.weight);
                const purchasePrice = parseFloat(investment.purchasePrice);
                const currentValue = weight * parseFloat(currentPriceData.pricePerGram);
                const profit = currentValue - purchasePrice;
                const profitPercentage = (profit / purchasePrice) * 100;
                
                return (
                  <tr key={investment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(investment.purchaseDate, "date")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {weight.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(purchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(currentValue)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${profit >= 0 ? 'text-[hsl(var(--increase))]' : 'text-[hsl(var(--decrease))]'}`}>
                      {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${profitPercentage >= 0 ? 'text-[hsl(var(--increase))]' : 'text-[hsl(var(--decrease))]'}`}>
                      {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Link href="/my-investments">
            <Button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-light))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary-light))] transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Investment
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentPerformance;
