import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClassAuthContext } from '../context/ClassAuthContext';
import StriksLogo from '../assets/striks-logo.png';

function LoginPage() {
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [userName, setUserName] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateClassLink, setShowCreateClassLink] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser, isPending, error, login } = useClassAuthContext();

  // Als gebruiker is ingelogd, doorsturen naar dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Toon de link naar de "klas aanmaken" pagina na 3 seconden
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCreateClassLink(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);
    
    // Eenvoudige validatie
    if (!className || !classCode || !userName) {
      setLoginError('Vul alle velden in');
      setIsLoading(false);
      return;
    }
    
    try {
      await login(className, classCode, userName);
      // Na succesvol inloggen stuurt useEffect ons door naar dashboard
    } catch (err) {
      setLoginError(err.message || 'Inloggen mislukt');
      setIsLoading(false);
    }
  };

  // Toon een eenvoudige laadstatus als de auth state wordt geladen
  if (isPending) {
    return (
      <div className="min-h-screen bg-striksLight flex items-center justify-center">
        <div className="text-xl text-striksMarine">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-striksLight flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <img src={StriksLogo} alt="Striks Logo" className="h-28 mb-4" />
          <h2 className="text-center text-3xl font-bold text-striksMarine">
            AutoMaatje
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Powered by Striks Consulting
          </p>
        </div>
        
        {/* Foutmelding weergeven */}
        {(loginError || error) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
            <span className="block sm:inline">{loginError || error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="class-name" className="block text-sm font-medium text-gray-700 mb-1">
                Klas
              </label>
              <input
                id="class-name"
                name="className"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-striksRose focus:border-striksRose focus:z-10 sm:text-sm"
                placeholder="Voer uw klasnaam in"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="class-code" className="block text-sm font-medium text-gray-700 mb-1">
                Code
              </label>
              <input
                id="class-code"
                name="classCode"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-striksRose focus:border-striksRose focus:z-10 sm:text-sm"
                placeholder="Voer de toegangscode in"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">
                Uw naam
              </label>
              <input
                id="user-name"
                name="userName"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-striksRose focus:border-striksRose focus:z-10 sm:text-sm"
                placeholder="Voer uw naam in"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-striksMarine hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-striksRose ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </div>
          
          {/* Link voor voorbeeld inlog */}
          <div className="text-center text-sm mt-6 p-3 bg-striksLight rounded-md">
            <p className="text-gray-600 font-medium">
              Voorbeeld:<br />
              Klas: Groep 8<br />
              Code: ABC123<br />
              Naam: [Uw naam]
            </p>
          </div>
          
          {/* Link naar klas aanmaken pagina (onopvallend) */}
          {showCreateClassLink && (
            <div className="text-center text-xs mt-4 opacity-60 hover:opacity-100 transition-opacity">
              <Link to="/create-class" className="text-striksRose hover:text-striksRose hover:underline">
                Nieuwe klas aanmaken
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginPage; 