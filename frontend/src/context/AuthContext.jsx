import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextInstance';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const logoutUser = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('activeRide');
  };

  return (
    <AuthContext.Provider value={{ user, token, login: loginUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

