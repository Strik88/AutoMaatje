import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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