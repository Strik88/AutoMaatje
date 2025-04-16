import React, { useState } from 'react';
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { auth, db, USER_ROLES, createUserProfile } from '../firebase.ts';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(USER_ROLES.PARENT);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Dit e-mailadres is al in gebruik. Kies een ander e-mailadres of log in.';
      case 'auth/invalid-email':
        return 'Ongeldig e-mailadres. Controleer het e-mailadres en probeer opnieuw.';
      case 'auth/operation-not-allowed':
        return 'E-mail/wachtwoord inloggen is niet ingeschakeld in Firebase.';
      case 'auth/weak-password':
        return 'Het wachtwoord is te zwak. Gebruik minimaal 6 tekens.';
      default:
        return 'Registratie mislukt. Probeer het opnieuw.';
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens bevatten');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      console.log('Registratie starten voor:', email);
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      console.log('Gebruiker aangemaakt, UID:', userCredential.user.uid);
      
      // Gebruikersprofiel aanmaken
      console.log('Gebruikersprofiel aanmaken met rol:', role);
      await createUserProfile(userCredential.user.uid, {
        name,
        email,
        phone,
        role,
      });
      
      console.log('Registratie succesvol, doorsturen naar home');
      navigate('/'); // Redirect naar homepage na succesvolle registratie
    } catch (error) {
      console.error('Registratie fout:', error);
      const authError = error as AuthError;
      setError(getErrorMessage(authError.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Registreren</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="name">Naam</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
          <label htmlFor="phone">Telefoonnummer</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optioneel"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Rol</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value={USER_ROLES.PARENT}>Ouder (zonder auto)</option>
            <option value={USER_ROLES.DRIVER}>Rijdende ouder</option>
            <option value={USER_ROLES.ADMIN}>Klasouder/Docent</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="password">Wachtwoord</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <small>Minimaal 6 tekens</small>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Wachtwoord bevestigen</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <button 
          type="submit" 
          className="register-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Bezig met registreren...' : 'Registreren'}
        </button>
      </form>
      <p>
        Heeft u al een account?{' '}
        <button 
          className="link-button" 
          onClick={() => navigate('/login')}
        >
          Inloggen
        </button>
      </p>
    </div>
  );
};

export default Register; 