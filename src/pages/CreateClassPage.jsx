import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClassAuthContext } from '../context/ClassAuthContext';
import StriksLogo from '../assets/striks-logo.png';

function CreateClassPage() {
  const [className, setClassName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [suggestedAccessCode, setSuggestedAccessCode] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser, isPending, createClass } = useClassAuthContext();

  // Als gebruiker is ingelogd, doorsturen naar dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Genereer een willekeurige toegangscode als suggestie
  useEffect(() => {
    const generateRandomCode = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    };
    
    setSuggestedAccessCode(generateRandomCode());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Gebruik de gesuggereerde code als er geen handmatige invoer is
    const finalAccessCode = accessCode || suggestedAccessCode;
    
    try {
      await createClass(className, adminName, finalAccessCode);
      // Na succesvol aanmaken stuurt useEffect ons door naar dashboard
    } catch (err) {
      setError(err.message || 'Klas aanmaken mislukt');
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
            Nieuwe Klas Aanmaken
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AutoMaatje - Powered by Striks Consulting
          </p>
        </div>
        
        {/* Foutmelding weergeven */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="class-name" className="block text-sm font-medium text-gray-700 mb-1">
                Klasnaam
              </label>
              <input
                id="class-name"
                name="className"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-striksRose focus:border-striksRose focus:z-10 sm:text-sm"
                placeholder="Bijv. Groep 8, Klas 3A, etc."
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="admin-name" className="block text-sm font-medium text-gray-700 mb-1">
                Uw naam (beheerder)
              </label>
              <input
                id="admin-name"
                name="adminName"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-striksRose focus:border-striksRose focus:z-10 sm:text-sm"
                placeholder="Voer uw naam in"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-1">
                Toegangscode
              </label>
              <div className="flex items-center">
                <input
                  id="access-code"
                  name="accessCode"
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-l-md focus:outline-none focus:ring-striksRose focus:border-striksRose focus:z-10 sm:text-sm"
                  placeholder={suggestedAccessCode}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-gray-500 hover:bg-gray-600"
                  onClick={() => setAccessCode(suggestedAccessCode)}
                  disabled={isLoading}
                >
                  Gebruik
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Een toegangscode is vereist. Als u er geen invoert, wordt de suggestie automatisch gebruikt.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-striksMarine hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-striksRose ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Bezig met aanmaken...' : 'Klas aanmaken'}
            </button>
          </div>
          
          <div className="text-center text-sm mt-4">
            <p className="text-gray-600">
              Terug naar{' '}
              <Link to="/login" className="font-medium text-striksRose hover:text-striksRose hover:underline">
                Login
              </Link>
            </p>
          </div>
          
          <div className="text-xs text-gray-500 mt-6 border-t pt-4">
            <p>
              <strong>Let op:</strong> Als beheerder kunt u:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>Ritten aanmaken voor de klas</li>
              <li>De klasinstellingen wijzigen</li>
              <li>Gebruikers toevoegen of verwijderen</li>
            </ul>
            <p className="mt-2">
              Deel de klasnaam en toegangscode met de ouders die aan deze klas moeten deelnemen.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClassPage; 