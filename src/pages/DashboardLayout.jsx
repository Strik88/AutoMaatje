import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useRideContext } from '../context/RideContext';
import StriksLogo from '../assets/striks-logo.png';

function DashboardLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const { currentTrip, loading } = useRideContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Actieve navigatielink styling
  const getLinkClass = ({ isActive }) => 
    `px-4 py-2 rounded-md font-medium ${isActive 
      ? 'bg-striksMarine text-white' 
      : 'text-striksMarine hover:bg-striksLight hover:text-striksRose'}`;

  const getMobileLinkClass = ({ isActive }) => 
    `block w-full px-4 py-3 rounded-md font-medium text-center ${isActive 
      ? 'bg-striksMarine text-white' 
      : 'text-striksMarine hover:bg-striksLight hover:text-striksRose'}`;
  
  return (
    <div className="min-h-screen bg-striksLight flex flex-col">
      <header className="bg-white text-striksMarine shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={StriksLogo} alt="Striks Logo" className="h-10 md:h-12 mr-2 md:mr-3" />
              <div className="font-bold text-lg md:text-xl text-striksMarine">AutoMaatje</div>
            </div>
            
            {/* Hamburger menu voor mobiel */}
            <button 
              className="md:hidden p-2 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            
            {/* Desktop navigatie */}
            <div className="hidden md:flex items-center space-x-1">
              <nav className="flex space-x-2">
                <NavLink to="/trips" className={getLinkClass}>
                  Ritten
                </NavLink>
                <NavLink to="/heenreis" className={getLinkClass}>
                  Heenreis
                </NavLink>
                <NavLink to="/terugreis" className={getLinkClass}>
                  Terugreis
                </NavLink>
                <NavLink to="/manage" className={getLinkClass}>
                  Beheren
                </NavLink>
              </nav>
              
              <div className="ml-4 flex items-center">
                {user && (
                  <span className="text-sm mr-3 text-striksMarine">
                    {user.email}
                  </span>
                )}
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1 border border-striksRose text-striksRose rounded-md hover:bg-striksRose hover:text-white transition-colors font-medium"
                >
                  Uitloggen
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobiele navigatie */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pb-2 space-y-2">
              <nav className="flex flex-col space-y-2">
                <NavLink to="/trips" className={getMobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  Ritten
                </NavLink>
                <NavLink to="/heenreis" className={getMobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  Heenreis
                </NavLink>
                <NavLink to="/terugreis" className={getMobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  Terugreis
                </NavLink>
                <NavLink to="/manage" className={getMobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  Beheren
                </NavLink>
              </nav>
              <div className="pt-2 mt-2 border-t border-gray-200 text-center">
                {user && (
                  <span className="text-sm text-striksMarine block mb-2">
                    {user.email}
                  </span>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full px-3 py-2 border border-striksRose text-striksRose rounded-md hover:bg-striksRose hover:text-white transition-colors font-medium"
                >
                  Uitloggen
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl text-striksMarine">Laden...</div>
        </div>
      ) : (
        <main className="flex-grow py-4 md:py-6">
          {currentTrip && (
            <div className="container mx-auto px-4 mb-4">
              <div className="bg-white p-3 md:p-4 rounded-lg shadow-md border-l-4 border-striksTurquoise">
                <h2 className="font-bold text-striksMarine">{currentTrip.title}</h2>
                <p className="text-sm text-gray-600">
                  {currentTrip.destination} - {new Date(currentTrip.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      )}
      
      <footer className="py-4 bg-striksMarine text-white text-center text-sm">
        <div className="container mx-auto">
          <p className="flex flex-col sm:flex-row items-center justify-center">
            <span>AutoMaatje &copy; {new Date().getFullYear()}</span>
            <span className="hidden sm:inline mx-2">|</span>
            <span>Powered by Striks Consulting</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default DashboardLayout; 