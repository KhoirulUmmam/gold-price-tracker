import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";

const PriceCard = ({ title, value, change, changePercent, changeText, icon, gradientClass }) => {
  const isIncrease = change > 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">{title}</span>
            <span className="text-2xl font-bold mt-1">{formatCurrency(value)}</span>
          </div>
          <div className={`w-12 h-12 ${gradientClass} rounded-full flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isIncrease ? "bg-green-100 text-[hsl(var(--increase))]" : "bg-red-100 text-[hsl(var(--decrease))]"
          }`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={isIncrease ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
              />
            </svg>
            {isIncrease ? '+' : ''}{changePercent}%
          </span>
          <span className="text-xs text-gray-500 ml-2">{changeText}</span>
        </div>
      </div>
      <div className={`h-1 ${
        isIncrease 
          ? "bg-gradient-to-r from-[hsl(var(--increase))] to-green-300" 
          : "bg-gradient-to-r from-[hsl(var(--decrease))] to-red-300"
      }`}></div>
    </div>
  );
};

const PriceCards = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-5 w-36" />
          </Card>
        ))}
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Card className="p-5 text-center">
          <p>No price data available</p>
        </Card>
      </div>
    );
  }
  
  // Calculate changes
  const buyPriceChange = data.buyPriceChange || 0;
  const sellPriceChange = data.sellPriceChange || 0;
  const priceChange = data.priceChange || 0;
  
  // Calculate percentage changes
  const buyPriceChangePercent = data.buyPrice ? ((buyPriceChange / data.buyPrice) * 100).toFixed(1) : "0.0";
  const sellPriceChangePercent = data.sellPrice ? ((sellPriceChange / data.sellPrice) * 100).toFixed(1) : "0.0";
  const priceChangePercent = data.pricePerGram ? ((priceChange / data.pricePerGram) * 100).toFixed(1) : "0.0";
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {/* Current Price Card */}
      <PriceCard
        title="Current Price"
        value={data.pricePerGram}
        change={priceChange}
        changePercent={priceChangePercent}
        changeText={`${priceChange >= 0 ? '+' : ''}${formatCurrency(priceChange)} today`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        gradientClass="gold-gradient"
      />
      
      {/* Buy Price Card */}
      <PriceCard
        title="Buy Price"
        value={data.buyPrice}
        change={buyPriceChange}
        changePercent={buyPriceChangePercent}
        changeText={`${buyPriceChange >= 0 ? '+' : ''}${formatCurrency(buyPriceChange)} today`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        gradientClass="bg-[hsl(var(--primary-light))]"
      />
      
      {/* Sell Price Card */}
      <PriceCard
        title="Sell Price"
        value={data.sellPrice}
        change={sellPriceChange}
        changePercent={sellPriceChangePercent}
        changeText={`${sellPriceChange >= 0 ? '+' : ''}${formatCurrency(sellPriceChange)} today`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        }
        gradientClass="bg-purple-600"
      />
      
      {/* 24h High Card */}
      <PriceCard
        title="24h High"
        value={data.highPrice || data.pricePerGram}
        change={1} // Always positive
        changePercent="0.0"
        changeText={data.highPriceTime || "4 hours ago"}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        gradientClass="bg-blue-600"
      />
    </div>
  );
};

export default PriceCards;
