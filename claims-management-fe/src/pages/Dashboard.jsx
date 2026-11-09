import React from 'react'
import { useAuth } from '../hooks/auth';

const Dashboard = () => {
  const { auth } = useAuth();
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard