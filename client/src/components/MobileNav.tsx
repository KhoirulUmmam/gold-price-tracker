import React from "react";
import { Link, useLocation } from "wouter";

const MobileNav = () => {
  const [location] = useLocation();

  const isActive = (path) => {
    return location === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around md:hidden z-10">
      <Link href="/">
        <a className={`flex flex-col items-center justify-center w-full h-full ${isActive("/") ? "text-[hsl(var(--primary))]" : "text-gray-500"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1">Dashboard</span>
        </a>
      </Link>
      <Link href="/price-history">
        <a className={`flex flex-col items-center justify-center w-full h-full ${isActive("/price-history") ? "text-[hsl(var(--primary))]" : "text-gray-500"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs mt-1">History</span>
        </a>
      </Link>
      <Link href="/calculator">
        <a className={`flex flex-col items-center justify-center w-full h-full ${isActive("/calculator") ? "text-[hsl(var(--primary))]" : "text-gray-500"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="text-xs mt-1">Calculator</span>
        </a>
      </Link>
      <Link href="/notifications">
        <a className={`flex flex-col items-center justify-center w-full h-full relative ${isActive("/notifications") ? "text-[hsl(var(--primary))]" : "text-gray-500"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs mt-1">Alerts</span>
          <span className="absolute top-1 right-6 h-5 w-5 flex items-center justify-center bg-[hsl(var(--gold))] text-[hsl(var(--primary))] text-xs font-semibold rounded-full">3</span>
        </a>
      </Link>
    </div>
  );
};

export default MobileNav;
