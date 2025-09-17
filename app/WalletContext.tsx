"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { UiWalletAccount, UiWallet } from "@wallet-standard/react";

interface ConnectedWallet {
  account: UiWalletAccount;
  wallet: UiWallet;
}

interface WalletContextType {
  account: UiWalletAccount | null;
  wallet: UiWallet | null;
  connectedWallet: ConnectedWallet | null;
  setConnectedWallet: (wallet: ConnectedWallet | null) => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connectedWallet, setConnectedWallet] =
    useState<ConnectedWallet | null>(null);

  const value = {
    account: connectedWallet?.account || null,
    wallet: connectedWallet?.wallet || null,
    connectedWallet,
    setConnectedWallet,
    isConnected: !!connectedWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
