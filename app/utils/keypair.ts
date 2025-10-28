import { create } from "zustand";
import type { KeyPairSigner } from "@solana/signers";
import { createKeyPairSignerFromPrivateKeyBytes } from "@solana/signers";

const COOKIE_NAME = "solana_internal_wallet_key";
const isBrowser = () => typeof window !== "undefined";

const getCookie = (name: string): string | null => {
  if (!isBrowser()) return null;
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.split("=").slice(1).join("=")) : null;
};

const setCookie = (name: string, value: string, days = 365) => {
  if (!isBrowser()) return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const base64UrlToBytes = (base64Url: string): Uint8Array => {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

interface KeypairState {
  publicKey: string | null;
  hasKeypair: boolean;
  signer: KeyPairSigner | null;

  // Actions
  generateKeypair: () => Promise<void>;
  clearKeypair: () => void;
}

export const useKeypairStore = create<KeypairState>()((set) => {
  const restoreFromCookie = async () => {
    try {
      const encoded = getCookie(COOKIE_NAME);
      if (!encoded) return;
      const privateKeyBytes = base64UrlToBytes(encoded);
      if (privateKeyBytes.length !== 32) {
        throw new Error("Invalid private key length");
      }

      const signer = await createKeyPairSignerFromPrivateKeyBytes(
        privateKeyBytes,
        true
      );

      set({
        publicKey: signer.address,
        hasKeypair: true,
        signer,
      });
    } catch (error) {
      console.error("Failed to restore keypair from cookie:", error);
      deleteCookie(COOKIE_NAME);
    }
  };

  if (isBrowser()) {
    void restoreFromCookie();
  }

  return {
    publicKey: null,
    hasKeypair: false,
    signer: null,

    generateKeypair: async () => {
      if (!isBrowser() || !globalThis.crypto?.getRandomValues) {
        console.error("Crypto API not available in this environment");
        return;
      }

      try {
        const privateKeyBytes = new Uint8Array(32);
        globalThis.crypto.getRandomValues(privateKeyBytes);

        const signer = await createKeyPairSignerFromPrivateKeyBytes(
          privateKeyBytes,
          true
        );

        setCookie(COOKIE_NAME, bytesToBase64Url(privateKeyBytes));

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
      deleteCookie(COOKIE_NAME);
      set({
        publicKey: null,
        hasKeypair: false,
        signer: null,
      });
    },
  };
});
