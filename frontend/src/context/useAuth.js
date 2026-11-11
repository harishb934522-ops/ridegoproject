import { useContext } from 'react';
import { AuthContext } from './AuthContextInstance';

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

