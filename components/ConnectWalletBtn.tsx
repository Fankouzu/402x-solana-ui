import { useState } from "react";
import { useWallets } from "@wallet-standard/react";
import { useWallet } from "@/app/WalletContext";

import { Button } from "./ui/button";
import { WalletListModal } from "./WalletListModal";

export function ConnectWalletBtn() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wallets = useWallets();
  const { isConnected } = useWallet();

  const solanaWallets = wallets.filter((wallet) =>
    wallet.chains.some((chain) => chain.startsWith("solana:"))
  );

  if (isConnected) {
    return null; // Don't show connect button when already connected
  }

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>Connect Wallet</Button>
      <WalletListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wallets={solanaWallets}
      />
    </>
  );
}
