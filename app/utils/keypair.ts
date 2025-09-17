import { create } from "zustand";
import type { KeyPairSigner } from "@solana/signers";
import { generateKeyPairSigner } from "gill";

interface KeypairState {
  publicKey: string | null;
  hasKeypair: boolean;
  signer: KeyPairSigner | null;

  // Actions
  generateKeypair: () => Promise<void>;
  clearKeypair: () => void;
}

export const useKeypairStore = create<KeypairState>()((set) => ({
  publicKey: null,
  hasKeypair: false,
  signer: null,

  generateKeypair: async () => {
    try {
      const signer = await generateKeyPairSigner();
      set({
        publicKey: signer.address,
        hasKeypair: true,
        signer,
      });
    } catch (error) {
      console.error("Failed to generate keypair:", error);
    }
  },

  clearKeypair: () => {
    set({
      publicKey: null,
      hasKeypair: false,
      signer: null,
    });
  },
}));
