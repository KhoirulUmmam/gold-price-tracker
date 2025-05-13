import React from "react";
import { Link, useLocation } from "wouter";

const Sidebar = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-[hsl(var(--sidebar-background))] text-white fixed h-full z-10">
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[hsl(var(--sidebar-background))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h1 className="text-xl font-display font-bold">GoldTrack</h1>
      </div>
      
      <nav className="mt-6 flex-1">
        <div className="px-4 py-2 text-xs uppercase text-gray-400 tracking-wider">Main</div>
        <Link href="/" className={isActive("/") ? "sidebar-link-active" : "sidebar-link"}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
        <Link href="/price-history" className={isActive("/price-history") ? "sidebar-link-active" : "sidebar-link"}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Price History
        </Link>
        <Link href="/calculator" className={isActive("/calculator") ? "sidebar-link-active" : "sidebar-link"}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Calculator
        </Link>
        <Link href="/notifications" className={isActive("/notifications") ? "sidebar-link-active" : "sidebar-link"}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notifications
          <span className="bg-[hsl(var(--gold))] text-[hsl(var(--sidebar-background))] text-xs font-semibold px-2 py-0.5 rounded-full ml-auto">3</span>
        </Link>
        
        <div className="px-4 py-2 text-xs uppercase text-gray-400 tracking-wider mt-6">Portfolio</div>
        <Link href="/my-investments" className={isActive("/my-investments") ? "sidebar-link-active" : "sidebar-link"}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          My Investments
        </Link>
        <Link href="/profit-analytics" className={isActive("/profit-analytics") ? "sidebar-link-active" : "sidebar-link"}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Profit Analytics
        </Link>
      </nav>
      
      <div className="p-4">
        <div className="bg-[hsl(var(--sidebar-primary))] rounded-lg p-3">
          <h3 className="text-sm font-semibold">Upgrade to Pro</h3>
          <p className="text-xs text-gray-300 mt-1">Get advanced features and priority notifications</p>
          <button className="mt-3 w-full bg-[hsl(var(--gold))] text-[hsl(var(--sidebar-background))] font-medium text-sm py-1.5 rounded-md hover:bg-[hsl(var(--gold-dark))] transition">Upgrade</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
