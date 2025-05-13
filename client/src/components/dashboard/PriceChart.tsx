import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";

const TIMEFRAME_OPTIONS = [
  { label: "1D", value: "1d", active: true },
  { label: "1W", value: "1w", active: false },
  { label: "1M", value: "1m", active: false },
  { label: "1Y", value: "1y", active: false },
];

const PriceChart = () => {
  const [timeframe, setTimeframe] = useState("1d");
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  // Fetch chart data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/gold-prices/chart', timeframe],
  });
  
  useEffect(() => {
    if (!data || !chartRef.current) return;
    
    // Clean up previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create chart using chart.js (imported via CDN in index.html)
    const ctx = chartRef.current.getContext('2d');
    
    // Prepare data
    const labels = data.map(item => item.label);
    const prices = data.map(item => item.price);
    
    // Create the chart
    chartInstance.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Gold Price (Rp)',
          data: prices,
          borderColor: 'hsl(var(--gold))',
          backgroundColor: 'rgba(255, 215, 0, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += formatCurrency(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            grid: {
              borderDash: [2, 4],
              color: '#e0e0e0'
            },
            ticks: {
              callback: function(value) {
                return 'Rp ' + (value / 1000) + 'K';
              }
            }
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);
  
  if (error) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="p-5">
          <div className="text-center p-6">
            <p className="text-red-500">Failed to load chart data</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white rounded-xl shadow-sm lg:col-span-2">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Price History</h2>
          <div className="flex items-center space-x-2 mt-3 sm:mt-0">
            {TIMEFRAME_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={timeframe === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(option.value)}
                className={timeframe === option.value ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-light))]" : ""}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-4 h-72 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-2 w-full">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-5/6 mx-auto" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-4/6 mx-auto" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-3/6 mx-auto" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">No chart data available</p>
            </div>
          ) : (
            <canvas ref={chartRef}></canvas>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PriceChart;
