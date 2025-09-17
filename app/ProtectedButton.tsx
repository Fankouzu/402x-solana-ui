"use client";
import { useState } from "react";
import { useWallet } from "./WalletContext";
import { useWalletAccountMessageSigner } from "@solana/react";
import { createSigner, wrapFetchWithPayment } from "x402-fetch";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";
import { generateKeyPairSigner } from "@solana/signers";
import { useKeypairStore } from "./utils/keypair";

export function ProtectedButton() {
  const [loading, setLoading] = useState(false);
  const { account, isConnected } = useWallet();
  const { publicKey, hasKeypair, signer, generateKeypair, clearKeypair } =
    useKeypairStore();

  if (!account) {
    return <div>Please connect your wallet</div>;
  }

  const callProtectedRoute = async () => {
    if (!account) {
      console.log("Account or Signer problem");
      return;
    }

    setLoading(true);
    try {
      if (!signer) {
        console.log("Signer Not Found");
        return;
      }

      console.log("SIGNER", signer.address);
      // For now, let's use a simple approach without createSigner
      const fetchWithPay = wrapFetchWithPayment(fetch, signer);
      fetchWithPay("/api/protected", {
        method: "GET",
      })
        .then(async (response) => {
          const body = await response.json();
          console.log(body);

          const paymentResponse = decodeXPaymentResponse(
            response.headers.get("x-payment-response")!
          );
          console.log(paymentResponse);
        })
        .catch((error) => {
          console.error(error.response?.data?.error);
        });
    } catch (error) {
      console.log("Error", error);
      //   setResponse(
      //     `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      //   );
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={callProtectedRoute}
      disabled={loading}
      className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Processing Payment..." : "Access Protected Content ($0.01)"}
    </button>
  );
}
