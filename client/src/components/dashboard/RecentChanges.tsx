import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

const RecentChanges = () => {
  // Fetch recent price changes
  const { data: recentChanges, isLoading, error } = useQuery({
    queryKey: ['/api/gold-prices/recent-changes'],
  });
  
  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm lg:col-span-2">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Recent Price Changes</h2>
        </div>
        <div className="overflow-hidden">
          <div className="p-4">
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full mt-4" />
            <Skeleton className="h-20 w-full mt-4" />
          </div>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow-sm lg:col-span-2">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Recent Price Changes</h2>
        </div>
        <CardContent className="p-5">
          <div className="text-center py-6">
            <p className="text-red-500">Failed to load price changes</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white rounded-xl shadow-sm lg:col-span-2">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Recent Price Changes</h2>
      </div>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!recentChanges || recentChanges.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No recent price changes available
                </td>
              </tr>
            ) : (
              recentChanges.map((change) => (
                <tr key={change.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(change.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(change.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      change.change > 0 
                        ? "bg-green-100 text-[hsl(var(--increase))]" 
                        : "bg-red-100 text-[hsl(var(--decrease))]"
                    }`}>
                      {change.change > 0 ? "+" : ""}{formatCurrency(change.change)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {change.type}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-center">
        <Link href="/price-history">
          <Button variant="link" className="px-4 py-2 text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-light))]">
            View All Changes
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default RecentChanges;
