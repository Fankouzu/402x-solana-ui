"use client";

import { useState } from "react";
import { useWallet } from "@/app/WalletContext";
import { useKeypairStore } from "@/app/utils/keypair";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import { transferDevnetUSDC } from "@/app/utils";
import { address } from "@solana/kit";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TransferModalProps {
  children: React.ReactNode;
  onTransferComplete?: () => void;
}

export function TransferModal({ children, onTransferComplete }: TransferModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);

  const { account } = useWallet();
  const { publicKey } = useKeypairStore();

  if (!account) {
    return null;
  }
  const signer = useWalletAccountTransactionSendingSigner(
    account,
    "solana:devnet"
  );

  const handleTransfer = async () => {
    if (!signer || !publicKey || !amount.trim()) {
      setTransferStatus(
        "Please fill in amount and ensure wallet is connected with local wallet generated"
      );
      return;
    }

    try {
      setIsTransferring(true);
      setTransferStatus("Initiating transfer...");

      const recipientAddress = address(publicKey);
      const transferAmount = parseFloat(amount);

      if (isNaN(transferAmount) || transferAmount <= 0) {
        setTransferStatus("Please enter a valid amount");
        return;
      }

      console.log("Signer address:", signer.address);
      console.log("Recipient address:", recipientAddress);
      console.log("Transfer amount:", transferAmount);

      await transferDevnetUSDC(signer, recipientAddress, transferAmount);

      setTransferStatus("Transfer completed successfully!");
      setAmount("");
      onTransferComplete?.();

      setTimeout(() => {
        setIsOpen(false);
        setTransferStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Transfer failed:", error);
      setTransferStatus(
        `Transfer failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsTransferring(false);
    }
  };

  if (!account) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-4" />
            Transfer USDC to Local Wallet
          </DialogTitle>
          <DialogDescription>
            Transfer USDC from your connected wallet to your local wallet on
            Devnet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Recipient (Local Wallet)
            </label>
            <div className="p-2 bg-muted rounded text-xs font-mono">
              {publicKey || "No local wallet generated"}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount (USDC)
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="0.1"
              min="0"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isTransferring}
            />
          </div>

          {transferStatus && (
            <div
              className={`p-3 rounded-md text-sm ${
                transferStatus.includes("successfully")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : transferStatus.includes("failed") ||
                    transferStatus.includes("error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {transferStatus}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isTransferring}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={isTransferring || !publicKey || !amount.trim()}
              className="flex-1"
            >
              {isTransferring ? "Transferring..." : "Transfer USDC"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
