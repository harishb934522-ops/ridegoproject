import { useContext } from 'react';
import { WalletContext } from './WalletContextInstance';

export function useWallet() {
  const context = useContext(WalletContext);
  return context;
}

