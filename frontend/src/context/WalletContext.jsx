import { useState, useEffect } from 'react';
import { WalletContext } from './WalletContextInstance';
import { soundEffects } from '../utils/audioCues';

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('ridego_wallet');
    return saved !== null ? Number(saved) : 250;
  });

  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('ridego_coins');
    return saved !== null ? Number(saved) : 50;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('ridego_wallet_tx');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'credit', title: 'Welcome Bonus', amount: 250, date: 'Initial Signup' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ridego_wallet', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('ridego_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('ridego_wallet_tx', JSON.stringify(transactions));
  }, [transactions]);

  const addFunds = (amount) => {
    const val = Number(amount);
    if (isNaN(val) || val <= 0) return false;
    setBalance((prev) => prev + val);
    setTransactions((prev) => [
      { id: Date.now(), type: 'credit', title: 'Wallet Top-Up', amount: val, date: 'Just now' },
      ...prev
    ]);
    soundEffects.playSuccessChime();
    return true;
  };

  const deductFunds = (amount, description = 'Ride Payment') => {
    const val = Number(amount);
    if (balance < val) return false;
    setBalance((prev) => prev - val);
    setTransactions((prev) => [
      { id: Date.now(), type: 'debit', title: description, amount: val, date: 'Just now' },
      ...prev
    ]);
    soundEffects.playSuccessChime();
    return true;
  };

  const addRewardCoins = (count) => {
    setCoins((prev) => prev + count);
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        coins,
        transactions,
        addFunds,
        deductFunds,
        addRewardCoins,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

