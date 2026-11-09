import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// ✨ Import all icons as a single namespace object
import * as Ri from "react-icons/ri"; 
import menuData from '../assets/data/menuitemsadmin.json'; 
import { useAuth } from '../hooks/auth'; // Ensure the path correctly points to your context hook
import { APIContext } from '../context/custom';

const SidebarAdmin = ({ dashboardType = "user" }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = useContext(APIContext).apiUrl;
  
  const { auth, setAuth } = useAuth();
  const menuItems = menuData?.menuItems || [];

  // Extract logging user meta fields safely
  const userName = auth?.user?.name || "User Profile";
  const userRole = auth?.user?.role || dashboardType;

  // ✅ Logout Handler Integration
  const handleLogout = async () => {
    try {
      // Best Practice: Call the server to destroy your Refresh Token session database side
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth?.token && { 'Authorization': `Bearer ${auth.token}` })
        }
      });
    } catch (error) {
      console.error("Backend server session termination failed:", error);
    } finally {
      // Wiping state regardless of API success to guarantee security container eviction locally
      setAuth({
        user: null,
        token: "",
        role: ""
      });
      localStorage.removeItem("auth");
      navigate('/login');
    }
  };

  return (
    <div className={`h-screen bg-white border-r border-gray-100 flex flex-col justify-between p-7 transition-all duration-300 sticky top-0 shrink-0 ${isOpen ? 'w-[306px]' : 'w-[100px]'}`}>
      <div>
        {/* Header Logo Section */}
        <div className={`flex items-center justify-between mb-12 ${!isOpen ? 'flex-col gap-6 justify-center' : ''}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <Link to={`/${dashboardType}/dashboard`} className="relative flex items-center justify-center text-3xl text-black font-bold shrink-0">
              <Ri.RiHexagonLine strokeWidth={1} />
              <div className="absolute w-2 h-2 rounded-full bg-black"></div>
            </Link>
            {isOpen && (
              <div className="flex items-baseline gap-1 animate-fadeIn">
                <span className="text-[26px] font-semibold tracking-tight text-gray-950">Dashboard</span>
                <span className="text-[10px] font-medium text-gray-400">v.01</span>
              </div>
            )}
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            {isOpen ? <Ri.RiMenuFoldLine size={20} /> : <Ri.RiMenuUnfoldLine size={20} />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-4">
          {menuItems.map((item) => {
            const IconComponent = Ri[item.icon] || Ri.RiHexagonLine;
            
            // ✅ Dynamically construct absolute matching paths for all layouts
            const basePrefix = `/${dashboardType}/dashboard`;
            const dynamicPath = item.path === "" ? basePrefix : `${basePrefix}/${item.path}`;
            const isActive = location.pathname === dynamicPath;

            return (
              <Link 
                key={item.name} 
                to={dynamicPath} 
                className={`w-full flex items-center justify-between rounded-xl transition-all duration-200 ${isOpen ? 'px-4 py-3.5' : 'p-3 justify-center'} ${isActive ? 'bg-[#5c3bf5] text-white shadow-md shadow-purple-100' : 'text-[#9197b3] hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center shrink-0 ${isOpen ? 'text-2xl' : 'text-[26px]'}`}>
                    <IconComponent strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  {isOpen && <span className="text-[15px] font-medium tracking-wide animate-fadeIn">{item.name}</span>}
                </div>
                {isOpen && item.hasSubmenu && (
                  <Ri.RiArrowRightSLine size={20} className={`transition-transform duration-200 cursor-pointer ${isActive ? 'text-white' : 'text-[#9197b3]'}`} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Box & Logout Trigger Wrapper */}
      <div className={`pt-4 border-t border-gray-100 flex ${isOpen ? 'items-center justify-between' : 'flex-col gap-4 items-center justify-center'}`}>
        {isOpen && (
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Visual Avatar Placeholder Circle */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2D3E50] to-[#4CA1AF] flex items-center justify-center text-white font-bold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col truncate min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate">{userName}</span>
              <span className="text-xs text-gray-400 capitalize truncate">{userRole}</span>
            </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          title="Sign Out"
          className={`p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer shrink-0`}
        >
          <Ri.RiLogoutBoxRLine size={22} />
        </button>
      </div>

    </div>
  );
};

export default SidebarAdmin;
