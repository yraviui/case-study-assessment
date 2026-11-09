import React from 'react'
import { LuUsers, LuUserCheck, LuMonitor } from "react-icons/lu";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import { img1, img2, img3, img4, img5 } from '../utils/img';

const ReportUpdates = ({ customers = [] }) => {
  const avatars = [img1, img2, img3, img4, img5];

  // Dynamic calculations based on incoming props data
  const totalCustomers = customers.length;
  const totalMembers = customers.filter(c => c.status === 'Inactive').length; // Kept label "Members" mapping onto static dataset representation
  const activeNow = customers.filter(c => c.status === 'Active').length;

  return (
    <div className="w-full max-w-5xl bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between divide-y md:divide-y-0 md:divide-x divide-gray-100 gap-6 md:gap-0">
      
      {/* 1. Total Customers */}
      <div className="flex items-center gap-3 w-full md:px-6 first:pl-0">
        <div className="w-16 h-16 shrink-0 bg-[#eefdf5] rounded-full flex items-center justify-center">
          <LuUsers className="text-[#00ac4f] text-3xl stroke-[1.75]" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-normal text-gray-400 whitespace-nowrap">Total Customers</span>
          <span className="text-3xl font-bold text-gray-800 tracking-tight leading-none mt-1 mb-1.5">
            {totalCustomers.toLocaleString()}
          </span>
          <span className="text-xs font-normal text-gray-400 flex items-center gap-0.5 whitespace-nowrap">
            <FiArrowUp className="text-[#00ac4f] font-bold text-sm" />
            <strong className="text-[#00ac4f] font-semibold">16%</strong> this month
          </span>
        </div>
      </div>

      {/* 2. Members */}
      <div className="flex items-center gap-5 w-full md:px-6 pt-6 md:pt-0">
        <div className="w-16 h-16 shrink-0 bg-[#eefdf5] rounded-full flex items-center justify-center">
          <LuUserCheck className="text-[#00ac4f] text-3xl stroke-[1.75]" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-normal text-gray-400">Members</span>
          <span className="text-2xl font-bold text-gray-800 tracking-tight leading-none mt-1 mb-1.5">
            {totalMembers.toLocaleString()}
          </span>
          <span className="text-xs font-normal text-gray-400 flex items-center gap-0.5 whitespace-nowrap">
            <FiArrowDown className="text-[#df0404] font-bold text-sm" />
            <strong className="text-[#df0404] font-semibold">1%</strong> this month
          </span>
        </div>
      </div>

      {/* 3. Active Now */}
      <div className="flex items-center gap-5 w-full md:px-6 last:pr-0 pt-6 md:pt-0">
        <div className="w-16 h-16 shrink-0 bg-[#eefdf5] rounded-full flex items-center justify-center">
          <LuMonitor className="text-[#00ac4f] text-3xl stroke-[1.75]" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-normal text-gray-400 whitespace-nowrap">Active Now</span>
          <span className="text-3xl font-bold text-gray-800 tracking-tight leading-none mt-1 mb-1.5">
            {activeNow.toLocaleString()}
          </span>
          <div className="flex -space-x-1.5 overflow-hidden mt-1">
            {avatars.slice(0, activeNow).map((imgSrc, i) => (
              <img key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src={imgSrc} alt="Active member profile" />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default ReportUpdates;