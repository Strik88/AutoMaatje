import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase.ts';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [firebaseStatus, setFirebaseStatus] = useState('');
  const navigate = useNavigate();

  // Test Firebase verbinding
  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        setFirebaseStatus('Testen van Firebase verbinding...');
        // Test Firestore verbinding
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        setFirebaseStatus('Firebase verbinding OK!');
      } catch (error) {
        console.error('Firebase verbindingsfout:', error);
        setFirebaseStatus(`Firebase verbindingsfout: ${error.message}`);
      }
    };

    testFirebaseConnection();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect naar homepage na succesvolle login
    } catch (error) {
      setError('Inloggen mislukt. Controleer uw e-mail en wachtwoord.');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <h2>Inloggen</h2>
      {firebaseStatus && <p className="firebase-status">{firebaseStatus}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Wachtwoord</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Inloggen</button>
      </form>
      <p>
        Nog geen account?{' '}
        <button 
          className="link-button" 
          onClick={() => navigate('/register')}
        >
          Registreren
        </button>
      </p>
    </div>
  );
};

export default Login; 