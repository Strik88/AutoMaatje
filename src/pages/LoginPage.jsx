import React, { useState } from 'react';
// TODO: Import authentication functions from Firebase setup

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // TODO: Add state for loading/error handling

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Implement Firebase email/password login
    console.log('Login attempt with:', email, password);
    // TODO: Redirect to dashboard on successful login
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login Automaatje</h2>
        {/* TODO: Add error message display */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold text-gray-700">Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mb-3 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            required
          />
          {/* TODO: Add password visibility toggle? */}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
            // TODO: Disable button while loading
          >
            Inloggen
          </button>
        </div>
        {/* TODO: Add link for registration or password reset if needed */}
      </form>
    </div>
  );
}

export default LoginPage; 