import React from 'react';
import useAuth from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

const OnlineUsers = () => {
  const { onlineUsers, currentUser } = useAuth();

  if (!currentUser || onlineUsers.length === 0) {
    return null;
  }

  // Als er alleen de huidige gebruiker online is, toon niets
  if (onlineUsers.length === 1 && onlineUsers[0].uid === currentUser.uid) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h2 className="text-lg font-medium text-gray-900 mb-3">Online gebruikers</h2>
      <div className="space-y-2">
        {onlineUsers.map(user => {
          // Sla de huidige gebruiker over
          if (user.uid === currentUser.uid) return null;
          
          return (
            <div key={user.uid} className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm font-medium text-gray-700">
                {user.displayName || user.email}
              </span>
              {user.lastLogin && user.lastLogin.toDate && (
                <span className="text-xs text-gray-500">
                  (ingelogd {formatDistanceToNow(user.lastLogin.toDate(), { 
                    addSuffix: true,
                    locale: nl
                  })})
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineUsers; 