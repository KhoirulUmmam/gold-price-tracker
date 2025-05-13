import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";

const PriceAlerts = () => {
  // Fetch active alerts
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['/api/alerts'],
  });
  
  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Price Alerts</h2>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <CardContent className="p-5 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Price Alerts</h2>
        </div>
        <CardContent className="p-5">
          <div className="text-center p-6">
            <p className="text-red-500">Failed to load alerts</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const AlertItem = ({ alert }) => {
    const getIcon = () => {
      if (alert.alertType === "increase") {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      } else if (alert.alertType === "decrease") {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      } else {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      }
    };
    
    const getBgClass = () => {
      if (alert.alertType === "increase") {
        return "bg-green-50 border-green-100";
      } else if (alert.alertType === "decrease") {
        return "bg-red-50 border-red-100";
      } else {
        return "bg-[hsl(var(--muted))] border-gray-200";
      }
    };
    
    const getIconBgClass = () => {
      if (alert.alertType === "increase") {
        return "bg-[hsl(var(--increase))]";
      } else if (alert.alertType === "decrease") {
        return "bg-[hsl(var(--decrease))]";
      } else {
        return "bg-gray-400";
      }
    };
    
    const getDescription = () => {
      if (alert.alertType === "increase") {
        return `Alert when > ${formatCurrency(alert.targetPrice)}`;
      } else if (alert.alertType === "decrease") {
        return `Alert when < ${formatCurrency(alert.targetPrice)}`;
      } else {
        return `Send at ${alert.dailyTime} daily`;
      }
    };
    
    const getTitle = () => {
      if (alert.alertType === "increase") {
        return "Price increase";
      } else if (alert.alertType === "decrease") {
        return "Price decrease";
      } else {
        return "Daily summary";
      }
    };
    
    return (
      <div className={`flex items-center justify-between p-3 ${getBgClass()} rounded-lg border`}>
        <div className="flex items-center">
          <div className={`w-8 h-8 flex items-center justify-center ${getIconBgClass()} rounded-full`}>
            {getIcon()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{getTitle()}</p>
            <p className="text-xs text-gray-500">{getDescription()}</p>
          </div>
        </div>
        <div className="flex items-center">
          {alert.whatsappEnabled && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              WhatsApp
            </span>
          )}
          {alert.telegramEnabled && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 ml-1">
              Telegram
            </span>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="bg-white rounded-xl shadow-sm">
      <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Price Alerts</h2>
        <Link href="/notifications">
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-light))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="sr-only">Add alert</span>
          </Button>
        </Link>
      </div>
      <CardContent className="p-5 space-y-4">
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No active price alerts</p>
            <Link href="/notifications">
              <Button>Set up alerts</Button>
            </Link>
          </div>
        ) : (
          alerts.slice(0, 3).map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))
        )}
        
        {alerts && alerts.length > 0 && (
          <div className="mt-4">
            <Link href="/notifications">
              <Button variant="outline" className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[hsl(var(--primary))] bg-[hsl(var(--primary-50))] hover:bg-[hsl(var(--primary-100))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary-light))] transition">
                Configure Channels
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceAlerts;
