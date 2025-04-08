import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRideContext } from '../context/RideContext';
import { useAuthContext } from '../context/AuthContext';
import { FiUser, FiUsers, FiLogOut } from 'react-icons/fi';
import { Tooltip } from '@mui/material';

const Header = () => {
  const location = useLocation();
  const { currentTrip, activeUsers } = useRideContext();
  const { user, logout } = useAuthContext();
  
  // Bereken aantal actieve gebruikers (actief in de afgelopen 5 minuten)
  const activeUserCount = activeUsers?.filter(u => {
    if (!u.lastActive) return false;
    const lastActiveTime = new Date(u.lastActive).getTime();
    const currentTime = new Date().getTime();
    const fiveMinutesInMs = 5 * 60 * 1000;
    return (currentTime - lastActiveTime) < fiveMinutesInMs;
  }).length || 0;
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Fout bij uitloggen:", error);
    }
  };
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            AutoMaatje
          </Link>
          
          {currentTrip && (
            <span className="ml-4 text-gray-600">
              {currentTrip.title} - {new Date(currentTrip.date).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center">
          {/* Actieve gebruikers indicator */}
          {currentTrip && activeUserCount > 0 && (
            <Tooltip 
              title={
                <div>
                  <p className="font-semibold mb-1">Actieve gebruikers:</p>
                  <ul>
                    {activeUsers
                      .filter(u => {
                        if (!u.lastActive) return false;
                        const lastActiveTime = new Date(u.lastActive).getTime();
                        const currentTime = new Date().getTime();
                        const fiveMinutesInMs = 5 * 60 * 1000;
                        return (currentTime - lastActiveTime) < fiveMinutesInMs;
                      })
                      .map(u => (
                        <li key={u.uid}>
                          {u.displayName || u.email}
                          {u.uid === user?.uid && " (jij)"}
                        </li>
                      ))
                    }
                  </ul>
                </div>
              } 
              arrow
            >
              <div className="flex items-center text-green-600 mr-6 cursor-pointer">
                <FiUsers className="mr-1" />
                <span>{activeUserCount}</span>
              </div>
            </Tooltip>
          )}
          
          {/* Navigatie links */}
          {currentTrip && (
            <nav className="mr-6">
              <ul className="flex space-x-6">
                <li>
                  <Link 
                    to="/trips" 
                    className={`text-gray-600 hover:text-blue-600 ${isActive('/trips')}`}
                  >
                    Ritten
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/heenreis" 
                    className={`text-gray-600 hover:text-blue-600 ${isActive('/heenreis')}`}
                  >
                    Heenreis
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/terugreis" 
                    className={`text-gray-600 hover:text-blue-600 ${isActive('/terugreis')}`}
                  >
                    Terugreis
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/beheren" 
                    className={`text-gray-600 hover:text-blue-600 ${isActive('/beheren')}`}
                  >
                    Beheren
                  </Link>
                </li>
              </ul>
            </nav>
          )}
          
          {/* Gebruikers gedeelte */}
          {user ? (
            <div className="flex items-center">
              <Tooltip title={user.email || "Ingelogd"}>
                <div className="flex items-center text-gray-600 mr-3">
                  <FiUser className="mr-1" />
                  <span>{user.displayName || user.email?.split('@')[0] || "Gebruiker"}</span>
                </div>
              </Tooltip>
              
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
                title="Uitloggen"
              >
                <FiLogOut />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-800"
            >
              Inloggen
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 