import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import OnlineUsers from '../components/OnlineUsers';

const DashboardPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welkom bij AutoMaatje</h1>
        <p className="mb-6 text-gray-600">
          Hallo {currentUser?.displayName || currentUser?.email || 'daar'}! Gebruik AutoMaatje om ritten te plannen en kinderen toe te wijzen aan auto's.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            to="/trips" 
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex flex-col items-center text-center transition-all"
          >
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">Beheer Ritten</h2>
            <p className="text-sm text-gray-600">Maak en beheer ritten voor schooluitjes</p>
          </Link>
          
          <Link 
            to="/heenreis" 
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg flex flex-col items-center text-center transition-all"
          >
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">Heenreis</h2>
            <p className="text-sm text-gray-600">Plan de heenreis voor een uitje</p>
          </Link>
          
          <Link 
            to="/terugreis" 
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg flex flex-col items-center text-center transition-all"
          >
            <div className="bg-purple-100 p-3 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">Terugreis</h2>
            <p className="text-sm text-gray-600">Plan de terugreis voor een uitje</p>
          </Link>
          
          <Link 
            to="/beheren" 
            className="bg-amber-50 hover:bg-amber-100 p-4 rounded-lg flex flex-col items-center text-center transition-all"
          >
            <div className="bg-amber-100 p-3 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">Beheer Details</h2>
            <p className="text-sm text-gray-600">Beheer auto's en kinderen voor een uitje</p>
          </Link>
        </div>
      </div>

      <OnlineUsers />
      
    </div>
  );
};

export default DashboardPage; 