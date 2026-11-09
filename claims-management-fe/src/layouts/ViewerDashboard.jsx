import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const ViewerDashboard = () => {
  return (
    <div className='flex min-h-screen max-w-full bg-gray-50/50 text-gray-800 antialiased'>
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar dashboardType="viewer" />

      {/* Dynamic Viewport Layout Content Box */}
      <main className='flex-1 min-w-0 flex flex-col p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8'>
        <Outlet />
      </main>
    </div>
  )
}

export default ViewerDashboard;