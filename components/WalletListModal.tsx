import {
  useConnect,
  useDisconnect,
  type UiWallet,
} from "@wallet-standard/react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWallet } from "@/app/WalletContext";
import { Button } from "./ui/button";

interface WalletListModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: UiWallet[];
}

export function WalletListModal({
  isOpen,
  onClose,
  wallets,
}: WalletListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <DialogDescription>Select a wallet to connect to.</DialogDescription>
        <div className="flex flex-col gap-2">
          {wallets.map((wallet) => (
            <WalletListItem
              key={wallet.name}
              wallet={wallet}
              onConnect={onClose}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface WalletItemProps {
  wallet: UiWallet;
  onConnect?: () => void;
}

export const WalletListItem = ({ wallet, onConnect }: WalletItemProps) => {
  const [isConnecting, connect] = useConnect(wallet);
  const [isDisconnecting, disconnect] = useDisconnect(wallet);
  const { setConnectedWallet, isConnected } = useWallet();

  useEffect(() => {
    if (isDisconnecting) {
      setConnectedWallet(null);
    }
  }, [isDisconnecting, setConnectedWallet]);

  const handleConnect = async () => {
    try {
      const connectedAccount = await connect();
      if (!connectedAccount.length) {
        console.warn(`Connect to ${wallet.name} but there are no accounts.`);
        return connectedAccount;
      }

      const first = connectedAccount[0];
      setConnectedWallet({ account: first, wallet });
      onConnect?.(); // Close modal after successful connection
      return connectedAccount;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full justify-start p-4 h-auto border-2 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
      onClick={isConnected ? disconnect : handleConnect}
      disabled={isConnecting}
    >
      <div className="flex items-center space-x-3 w-full">
        {wallet.icon ? (
          <img
            src={wallet.icon}
            alt={wallet.name}
            className="w-10 h-10 rounded-lg object-cover border border-border"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
            <span className="text-muted-foreground text-lg font-semibold">
              {wallet.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 text-left">
          <div className="font-semibold text-foreground">
            {isConnecting ? "Connecting..." : wallet.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {isConnecting ? "Please wait..." : "Click to connect"}
          </div>
        </div>
        {isConnecting && (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </Button>
  );
};
