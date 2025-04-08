import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useRide } from '../context/RideContext';
import { useAuthContext } from '../context/AuthContext';
import '../assets/striks-gradients.css';

// Logo import
import StriksLogo from '../assets/striks-logo.png';

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuthContext();
  const { currentTrip, loading } = useRide();
  const navigate = useNavigate();
  const location = useLocation();

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`${
          isActive
            ? 'bg-striksTurquoise text-white font-medium'
            : 'text-gray-700 hover:bg-striksLight'
        } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
      >
        {children}
      </Link>
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-gradient-primary shadow-md">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-10 w-auto" src={StriksLogo} alt="AutoMaatje" />
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex space-x-4">
                  <NavLink to="/trips">Trips</NavLink>
                  {currentTrip && (
                    <>
                      <NavLink to="/heenreis">Heenreis</NavLink>
                      <NavLink to="/terugreis">Terugreis</NavLink>
                      <NavLink to="/manage">Beheren</NavLink>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center">
                {currentUser && (
                  <div className="flex items-center space-x-4">
                    <span className="text-white text-sm font-medium">
                      {currentUser.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-striksRose hover:bg-striksPurple text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Uitloggen
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-striksTurquoise focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                to="/trips"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-striksLight"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trips
              </Link>
              {currentTrip && (
                <>
                  <Link
                    to="/heenreis"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-striksLight"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Heenreis
                  </Link>
                  <Link
                    to="/terugreis"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-striksLight"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Terugreis
                  </Link>
                  <Link
                    to="/manage"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-striksLight"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Beheren
                  </Link>
                </>
              )}
              {currentUser && (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-striksLight"
                >
                  Uitloggen ({currentUser.email})
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl font-semibold text-gray-600">Loading...</div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {currentTrip ? (
              <div className="mb-6 px-4 sm:px-0">
                <div className="border-b border-striksTurquoise pb-2 mb-4">
                  <h1 className="text-2xl font-semibold text-striksMarine">
                    {currentTrip.name} - {new Date(currentTrip.date).toLocaleDateString()}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Bestemming: {currentTrip.destination || 'Niet opgegeven'}
                  </p>
                </div>
              </div>
            ) : location.pathname !== '/trips' ? (
              <div className="bg-striksLight p-4 rounded-md shadow-sm mb-6">
                <p className="text-striksMarine">
                  Selecteer eerst een trip op de <Link to="/trips" className="text-striksRose hover:underline">Trips pagina</Link>.
                </p>
              </div>
            ) : null}
            <Outlet />
          </div>
        )}
      </main>

      <footer className="bg-striksMarine py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-white">
            &copy; {new Date().getFullYear()} AutoMaatje - Een product van Striks AI Consulting
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout; 