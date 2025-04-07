import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import StriksLogo from '../assets/striks-logo.png';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register, user, loading, error } = useAuthContext();

  // Als gebruiker is ingelogd, doorsturen naar dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError(null);
    
    // Validatie
    if (password !== confirmPassword) {
      setRegisterError('Wachtwoorden komen niet overeen');
      return;
    }
    
    if (password.length < 6) {
      setRegisterError('Wachtwoord moet minimaal 6 tekens bevatten');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(email, password);
      // Na succesvol registreren stuurt useEffect ons door naar dashboard
    } catch (err) {
      setRegisterError(err.message || 'Registratie mislukt');
      setIsLoading(false);
    }
  };

  // Toon een eenvoudige laadstatus als de auth state wordt geladen
  if (loading) {
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
            Maak een nieuw account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AutoMaatje - Powered by Striks Consulting
          </p>
        </div>
        
        {/* Foutmelding weergeven */}
        {(registerError || error) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
            <span className="block sm:inline">{registerError || error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-striksRose focus:border-striksRose focus:z-10 sm:text-sm"
                placeholder="Uw emailadres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Wachtwoord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-striksRose focus:border-striksRose focus:z-10 sm:text-sm"
                placeholder="Minimaal 6 tekens"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Bevestig wachtwoord
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-striksRose focus:border-striksRose focus:z-10 sm:text-sm"
                placeholder="Herhaal wachtwoord"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Bezig met registreren...' : 'Registreren'}
            </button>
          </div>
          
          <div className="text-center text-sm mt-4">
            <p className="text-gray-600">
              Heb je al een account?{' '}
              <Link to="/login" className="font-medium text-striksRose hover:text-striksRose hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage; 