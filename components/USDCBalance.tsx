"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useKeypairStore } from "@/app/utils/keypair";
import { getDevnetUSDCBalance } from "@/app/utils";
import { address } from "@solana/kit";
import { RefreshCw } from "lucide-react";

export interface USDCBalanceHandle {
  refresh: () => Promise<void>;
}

export const USDCBalance = forwardRef<USDCBalanceHandle>((_, ref) => {
  const { publicKey, hasKeypair } = useKeypairStore();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = async () => {
    if (!hasKeypair || !publicKey) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    try {
      const keypairAddress = address(publicKey);
      const usdcBalance = await getDevnetUSDCBalance(keypairAddress);
      setBalance(usdcBalance);
    } catch (error) {
      console.error("Failed to fetch USDC balance:", error);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchBalance,
  }));

  useEffect(() => {
    fetchBalance();
  }, [hasKeypair, publicKey]);

  if (!hasKeypair) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full">
      <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"></div>
      <span className="text-xs font-medium text-foreground">
        {isLoading ? (
          "Loading..."
        ) : (
          `${balance?.toFixed(2) ?? "0.00"} USDC`
        )}
      </span>
      <button
        onClick={fetchBalance}
        disabled={isLoading}
        className="ml-1 p-1 hover:bg-secondary rounded-full transition-colors disabled:opacity-50"
        title="Refresh balance"
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
});