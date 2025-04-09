import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useRide } from '../context/RideContext';
import { useAuthContext } from '../context/AuthContext';
import '../assets/striks-gradients.css';
import { FiHome, FiArrowRight, FiArrowLeft, FiSettings, FiUsers, FiLogOut } from 'react-icons/fi';
import { useClassAuthContext } from '../context/ClassAuthContext';

// Logo import
import StriksLogo from '../assets/striks-logo.png';

const DashboardLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, currentClass, onlineUsers, logout } = useClassAuthContext();
  const { currentTrip, loading } = useRide();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Eenvoudige checks voor actieve route
  const isActive = (path) => {
    return location.pathname === path ? 'bg-striksMarine text-white' : 'text-striksMarine hover:bg-striksTurquoise/10';
  };

  return (
    <div className="min-h-screen bg-striksLight flex flex-col">
      {/* Hoofdnavigatie */}
      <header className="bg-white shadow-md">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  className="h-8 w-auto mr-3"
                  src={StriksLogo}
                  alt="Striks Logo"
                />
                <span className="font-semibold text-xl text-striksMarine">AutoMaatje</span>
              </Link>
            </div>
            
            {/* Klasinformatie en gebruiker */}
            <div className="hidden md:block">
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <p className="text-sm font-medium text-gray-700">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentClass?.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 p-2 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Hamburger menu voor mobiel */}
            <div className="md:hidden">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobiel menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/trips"
                className={`${isActive('/trips')} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiHome className="mr-3" />
                  Ritten
                </div>
              </Link>
              <Link
                to="/heenreis"
                className={`${isActive('/heenreis')} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiArrowRight className="mr-3" />
                  Heenreis
                </div>
              </Link>
              <Link
                to="/terugreis"
                className={`${isActive('/terugreis')} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiArrowLeft className="mr-3" />
                  Terugreis
                </div>
              </Link>
              <Link
                to="/manage"
                className={`${isActive('/manage')} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiSettings className="mr-3" />
                  Beheren
                </div>
              </Link>
              
              {/* Gebruikersinformatie */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-striksMarine text-white flex items-center justify-center">
                      {currentUser?.name?.charAt(0) || '?'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{currentUser?.name}</div>
                    <div className="text-sm font-medium text-gray-500">{currentClass?.name}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FiLogOut className="mr-3" />
                      Uitloggen
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Zijnavigatie (verborgen op mobiel) */}
        <aside className="hidden md:flex md:flex-shrink-0 bg-white shadow-md">
          <div className="flex flex-col w-64">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <Link
                to="/trips"
                className={`${isActive('/trips')} px-3 py-2 rounded-md text-base font-medium flex items-center`}
              >
                <FiHome className="mr-3" />
                Ritten
              </Link>
              <Link
                to="/heenreis"
                className={`${isActive('/heenreis')} px-3 py-2 rounded-md text-base font-medium flex items-center`}
              >
                <FiArrowRight className="mr-3" />
                Heenreis
              </Link>
              <Link
                to="/terugreis"
                className={`${isActive('/terugreis')} px-3 py-2 rounded-md text-base font-medium flex items-center`}
              >
                <FiArrowLeft className="mr-3" />
                Terugreis
              </Link>
              <Link
                to="/manage"
                className={`${isActive('/manage')} px-3 py-2 rounded-md text-base font-medium flex items-center`}
              >
                <FiSettings className="mr-3" />
                Beheren
              </Link>
            </nav>
            
            {/* Online gebruikers */}
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiUsers className="mr-2" />
                  Online Gebruikers
                </div>
              </h3>
              <div className="mt-3 max-h-32 overflow-y-auto">
                {onlineUsers.length > 0 ? (
                  <ul className="space-y-2">
                    {onlineUsers.map(user => (
                      <li key={user.id} className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-600">{user.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">Geen andere gebruikers online</p>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Pagina-inhoud */}
        <main className="flex-1 overflow-y-auto bg-striksLight p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 