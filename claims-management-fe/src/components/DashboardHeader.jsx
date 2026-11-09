import React from 'react';
import { FiSearch } from "react-icons/fi";

const DashboardHeader = ({ searchTerm, setSearchTerm, name }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
      {/* Welcome Greeting */}
      <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-1 tracking-tight">
        Hello {name ? name : 'Evano'} 
        <span className="inline-block transform scale-110 select-none origin-bottom ml-1">👋</span>
        <span className="font-normal text-gray-900">,</span>
      </h1>

      {/* Styled Interactive Search Bar */}
      <div className="relative max-w-xs w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400 text-lg" />
        </div>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-normal text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all"
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
