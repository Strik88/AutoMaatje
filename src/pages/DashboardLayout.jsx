import React from 'react';
import { Link, Outlet } from 'react-router-dom';

function DashboardLayout() {
  // TODO: Add logic to get user info/role, handle logout

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Automaatje Dashboard</h1>
          <div>
            {/* TODO: Show different links based on user role */}
            <Link to="/heenreis" className="px-3 py-2 rounded hover:bg-gray-700">Heenreis</Link>
            <Link to="/terugreis" className="px-3 py-2 rounded hover:bg-gray-700">Terugreis</Link>
            {/* TODO: Add settings/profile link */}
            <button className="ml-4 px-3 py-2 bg-red-500 rounded hover:bg-red-700">Uitloggen</button>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {/* Nested routes (Heenreis, Terugreis) will render here */}
        <Outlet />
      </main>
      <footer className="bg-gray-200 text-center p-4 text-sm text-gray-600">
        © 2025 Automaatje
      </footer>
    </div>
  );
}

export default DashboardLayout; 