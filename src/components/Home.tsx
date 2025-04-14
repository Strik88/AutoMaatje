import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase.ts';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name);
          }
        }
      } catch (error) {
        console.error('Fout bij ophalen gebruikersgegevens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Fout bij uitloggen:', error);
    }
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="home-container">
      <h1>Welkom bij AutoMaatje</h1>
      {userName && <p>Hallo, {userName}!</p>}
      <div className="content">
        <p>Dit is uw persoonlijke dashboard.</p>
        <p>Hier kunt u al uw gegevens beheren en bekijken.</p>
      </div>
      <button onClick={handleLogout} className="logout-button">
        Uitloggen
      </button>
    </div>
  );
};

export default Home; 