import { useWallet } from "@/app/WalletContext";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet } from "lucide-react";

export function WalletInfo() {
  const { account, wallet, isConnected, setConnectedWallet } = useWallet();

  if (!isConnected || !account || !wallet) {
    return null;
  }

  // Format the public key to show first and last few characters
  const formatPublicKey = (pubkey: string) => {
    if (pubkey.length <= 12) return pubkey;
    return `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
  };

  const handleDisconnect = () => {
    setConnectedWallet(null);
  };

  return (
    <Button
      variant="outline"
      onClick={handleDisconnect}
      className="h-10 px-3 bg-background hover:bg-accent/50 border-border group"
    >
      <div className="flex items-center space-x-2">
        {wallet.icon ? (
          <img
            src={wallet.icon}
            alt="Wallet"
            className="w-5 h-5 rounded object-cover"
          />
        ) : (
          <Wallet className="w-5 h-5 text-muted-foreground" />
        )}
        <span className="text-sm font-mono text-foreground">
          {formatPublicKey(account.address)}
        </span>
        <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
      </div>
    </Button>
  );
}
