import React from 'react'
import { Outlet } from 'react-router-dom'
import SidebarUser from '../components/SidebarUser'

const UserDashboard = () => {
  return (
    <div className='flex min-h-screen max-w-full bg-gray-50/50 text-gray-800 antialiased'>
      {/* Persistent Left Navigation Sidebar */}
      <SidebarUser dashboardType="user" />

      {/* Dynamic Viewport Layout Content Box */}
      <main className='flex-1 min-w-0 flex flex-col p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8'>
        {/* Child routes (index, product, income, etc.) render here */}
        <Outlet />
      </main>
    </div>
  )
}

export default UserDashboard;
