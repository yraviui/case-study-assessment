import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Public Auth Components
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import PageNotFound from './pages/PageNotFound'

// Route Protectors
import RouteUser from './components/RouteUser'
import RouteAdmin from './components/RouteAdmin'

// Dashboard Layout Containers
import UserDashboard from './layouts/UserDashboard'
import AdminDashboard from './layouts/AdminDashboard'

// Shared Sub-Views
import AdminDashboardHome from './pages/admin/AdminDashboardHome'
import Product from './pages/Product'
import Customers from './pages/Customers'
import Income from './pages/Income'
import Promote from './pages/Promote'
import Help from './pages/Help'
import ViewerDashboard from './layouts/ViewerDashboard'
import ViewerDashboardHome from './pages/viewer/ViewerDashboardHome'
import RouteViewer from './components/RouteViewer'
import { Toaster } from 'react-hot-toast';
import UserDashboardHome from './pages/user/UserDashboardHome'

const App = () => {
  return (
    <>
    {/* ✅ Add the Toaster component layout container here */}
      <Toaster position="top-right" reverseOrder={false} />
    <Routes>
      {/* Public Pages Layout */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Staff / Standard User Layout (viewer, adjuster, claims_manager, admin) */}
      <Route path="/user" element={<RouteUser />}>
        <Route path="dashboard" element={<UserDashboard />}>
          <Route index element={<UserDashboardHome />} />
        </Route>
      </Route>

      {/* Strict Administrator Layout */}
      <Route path="/admin" element={<RouteAdmin />}>
        <Route path="dashboard" element={<AdminDashboard />}>
          <Route index element={<AdminDashboardHome />} />
          {/* Put any future admin-exclusive sub-pages here */}
        </Route>
      </Route>

      {/* Strict Administrator Layout */}
      {/* Change the layout grouping structure for /viewer to this absolute match: */}
      <Route path="/viewer" element={<RouteViewer />}>
        {/* Switch path="dashboard" to path="/viewer/dashboard" explicitly if nesting breaks */}
        <Route path="dashboard" element={<ViewerDashboard />}>
          <Route index element={<ViewerDashboardHome />} />
          <Route path="product" element={<Product />} />
          <Route path="customers" element={<Customers />} />
          <Route path="income" element={<Income />} />
          <Route path="promote" element={<Promote />} />
          <Route path="help" element={<Help />} />
        </Route>
      </Route>


      {/* Fallback Screen */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </>
  )
}

export default App
