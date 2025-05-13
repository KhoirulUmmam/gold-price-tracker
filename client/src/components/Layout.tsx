import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-5 px-4 md:px-6 pb-24 md:pb-10">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[hsl(var(--primary-dark))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h1 className="text-xl font-display font-bold text-[hsl(var(--primary))]">GoldTrack</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full bg-[hsl(var(--muted))] text-gray-700 hover:bg-[hsl(var(--muted-dark))] transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button 
              className="p-2 rounded-full bg-[hsl(var(--muted))] text-gray-700 hover:bg-[hsl(var(--muted-dark))] transition"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default Layout;
