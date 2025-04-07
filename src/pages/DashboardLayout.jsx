import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useRideContext } from '../context/RideContext';
import StriksLogo from '../assets/striks-logo.png';

function DashboardLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const { currentTrip, loading } = useRideContext();
  
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

  return (
    <div className="min-h-screen bg-striksLight flex flex-col">
      <header className="bg-white text-striksMarine shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img src={StriksLogo} alt="Striks Logo" className="h-12 mr-3" />
            <div className="font-bold text-xl text-striksMarine">AutoMaatje</div>
          </div>
          
          <div className="flex items-center space-x-1">
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
                <span className="text-sm mr-3 hidden md:inline text-striksMarine">
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
      </header>
      
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl text-striksMarine">Laden...</div>
        </div>
      ) : (
        <main className="flex-grow py-6">
          {currentTrip && (
            <div className="container mx-auto px-4 mb-4">
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-striksTurquoise">
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
      
      <footer className="py-4 bg-striksMarine text-white text-center">
        <div className="container mx-auto">
          <p className="flex items-center justify-center">
            <span>AutoMaatje &copy; {new Date().getFullYear()}</span>
            <span className="mx-2">|</span>
            <span className="text-sm">Powered by Striks Consulting</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default DashboardLayout; 