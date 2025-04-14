import React, { useEffect, useState } from 'react';
import { auth, db, USER_ROLES } from '../firebase.ts';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const Home: React.FC = () => {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Fout bij uitloggen:', error);
    }
  };

  const renderAdminDashboard = () => (
    <div className="dashboard admin-dashboard">
      <h2>Klasouder/Docent Dashboard</h2>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Ritten Beheren</h3>
          <p>Creëer en beheer ritten voor dagtrips en schooluitjes.</p>
          <button className="dashboard-button">Nieuwe Rit Aanmaken</button>
        </div>
        <div className="dashboard-card">
          <h3>Kinderen Beheren</h3>
          <p>Voeg kinderen toe en beheer hun gegevens.</p>
          <button className="dashboard-button">Kinderen Beheren</button>
        </div>
        <div className="dashboard-card">
          <h3>Auto's Toewijzen</h3>
          <p>Wijs kinderen toe aan beschikbare auto's.</p>
          <button className="dashboard-button">Auto Toewijzingen</button>
        </div>
      </div>
    </div>
  );

  const renderDriverDashboard = () => (
    <div className="dashboard driver-dashboard">
      <h2>Rijdende Ouder Dashboard</h2>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Mijn Auto</h3>
          <p>Beheer uw auto-informatie en beschikbaarheid.</p>
          <button className="dashboard-button">Auto Bijwerken</button>
        </div>
        <div className="dashboard-card">
          <h3>Mijn Ritten</h3>
          <p>Bekijk ritten waarbij u als chauffeur bent ingedeeld.</p>
          <button className="dashboard-button">Ritten Bekijken</button>
        </div>
        <div className="dashboard-card">
          <h3>Toegewezen Kinderen</h3>
          <p>Zie welke kinderen in uw auto meerijden.</p>
          <button className="dashboard-button">Toewijzingen Bekijken</button>
        </div>
      </div>
    </div>
  );

  const renderParentDashboard = () => (
    <div className="dashboard parent-dashboard">
      <h2>Ouder Dashboard</h2>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Mijn Kinderen</h3>
          <p>Beheer de gegevens van uw kinderen.</p>
          <button className="dashboard-button">Kinderen Bijwerken</button>
        </div>
        <div className="dashboard-card">
          <h3>Vervoersverzoeken</h3>
          <p>Dien vervoersverzoeken in voor uw kinderen.</p>
          <button className="dashboard-button">Verzoek Indienen</button>
        </div>
        <div className="dashboard-card">
          <h3>Toewijzingen Bekijken</h3>
          <p>Bekijk in welke auto's uw kinderen zijn ingedeeld.</p>
          <button className="dashboard-button">Toewijzingen Bekijken</button>
        </div>
      </div>
    </div>
  );

  const renderDashboardBasedOnRole = () => {
    if (!userProfile) return null;

    switch (userProfile.role) {
      case USER_ROLES.ADMIN:
        return renderAdminDashboard();
      case USER_ROLES.DRIVER:
        return renderDriverDashboard();
      case USER_ROLES.PARENT:
      default:
        return renderParentDashboard();
    }
  };

  if (loading) {
    return <div className="loading">Laden...</div>;
  }

  return (
    <div className="home-container">
      <header className="app-header">
        <h1>AutoMaatje</h1>
        <div className="user-info">
          {userProfile && (
            <>
              <span>Welkom, {userProfile.name}</span>
              <span className="role-badge">{userProfile.role}</span>
            </>
          )}
          <button onClick={handleLogout} className="logout-button">
            Uitloggen
          </button>
        </div>
      </header>

      <main className="dashboard-container">
        {renderDashboardBasedOnRole()}
      </main>
    </div>
  );
};

export default Home; 