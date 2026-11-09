import React, { useContext, useState } from 'react';
import { useAuth } from '../../hooks/auth'; 
import { useNavigate } from 'react-router-dom';
import { APIContext } from '../../context/custom';

const Login = () => {
  // Destructure as an Object to match Setup 1 from your auth context configuration
  const { auth, setAuth } = useAuth(); 
  const navigate = useNavigate(); 
  const API_URL = useContext(APIContext).apiUrl;
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const resBody = await response.json();

      if (!response.ok || !resBody.success) {
        throw new Error(resBody.message || 'Something went wrong');
      }

      // ✅ CRITICAL FIX: Destructure keys from nested data payload wrapper 
      // resBody matches: { success: true, message: "...", data: { accessToken, user } }
      const backendData = resBody.data;

      const authPayload = {
        user: backendData.user,
        token: backendData.accessToken, 
        role: backendData.user?.role,
      };

      setAuth({
        ...auth,
        ...authPayload
      });

      localStorage.setItem("auth", JSON.stringify(authPayload));

      // ✅ SUCCESS ROUTING MATRIX: Correctly maps role over to specific prefix guards
      const role = authPayload.role;
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'viewer') {
        navigate('/viewer/dashboard');
      } else {
        navigate('/user/dashboard'); 
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ABC Insurance company
          </h2>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="block text-sm font-medium text-gray-700 mb-1">For admin: admin@yraviprakash.com / Test@123</div>
          <div className="block text-sm font-medium text-gray-700 mb-1">For Test: demo@yraviprakash.com / Test@123</div>
          <div className="block text-sm font-medium text-gray-700 mb-1">For user: user@yraviprakash.com / Test@123</div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;