"use client";

import { useState, useCallback } from "react";
import { useWallet } from "../WalletContext";
import { useKeypairStore } from "../utils/keypair";
import { wrapFetchWithPayment } from "x402-fetch";
import { decodeXPaymentResponse } from "x402-axios";
import { getDevnetUSDCBalance } from "../utils";
import { address } from "@solana/kit";
import type { UIMessage } from "ai";

interface MessageWithTxSig extends UIMessage {
  txSignature?: string;
}

interface PaymentInfo {
  amount: string;
  signature?: string;
  status: "processing" | "completed" | "error" | null;
}

interface UseProtectedChatReturn {
  messages: MessageWithTxSig[];
  sendMessage: (message: { text: string; files?: any[] }) => Promise<void>;
  status: "idle" | "loading" | "error";
  error: string | null;
  paymentInfo: PaymentInfo;
}

export function useProtectedChat(): UseProtectedChatReturn {
  const [messages, setMessages] = useState<MessageWithTxSig[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    amount: "$0.1",
    signature: undefined,
    status: null,
  });

  const { account } = useWallet();
  const { signer } = useKeypairStore();

  const sendMessage = useCallback(
    async (message: { text: string; files?: any[] }) => {
      if ( !signer) {
        setError("Wallet not connected or signer not available");
        setStatus("error");
        return;
      }

      // Check USDC balance before proceeding
      const requiredAmount = 0.1; // $0.1 as specified in middleware
      try {
        const keypairAddress = address(signer.address);
        const balance = await getDevnetUSDCBalance(keypairAddress);

        if (balance < requiredAmount) {
          setError(
            `Insufficient USDC balance. Required: $${requiredAmount.toFixed(
              2
            )}, Available: $${balance.toFixed(
              2
            )}. Please transfer USDC to your local wallet.`
          );
          setStatus("error");
          return;
        }
      } catch (balanceError) {
        setError(
          "Failed to check USDC balance. Please ensure your local wallet has sufficient funds."
        );
        setStatus("error");
        return;
      }

      setStatus("loading");
      setError(null);
      setPaymentInfo({
        amount: "$0.1",
        signature: undefined,
        status: "processing",
      });

      try {
        // Add user message to the conversation
        const userMessage: MessageWithTxSig = {
          id: Date.now().toString(),
          role: "user",
          parts: [{ type: "text", text: message.text }],
        };

        setMessages((prev) => [...prev, userMessage]);

        // Create protected fetch
        const protectedFetch = wrapFetchWithPayment(fetch, signer);

        // Make request to chat API with payment
        const response = await protectedFetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        let currentTxSignature: string | undefined;

        // Decode payment response
        const paymentResponseHeader =
          response.headers.get("x-payment-response");
        if (paymentResponseHeader) {
          const paymentResponse = decodeXPaymentResponse(paymentResponseHeader);
          currentTxSignature = paymentResponse.transaction || undefined;
          if (paymentResponse.success) {
            setPaymentInfo({
              amount: "$0.1",
              signature: paymentResponse.transaction || undefined,
              status: "completed",
            });
          }
          if (paymentResponse.success == false) {
            setPaymentInfo({
              amount: "$0.1",
              signature: paymentResponse.transaction || undefined,
              status: "error",
            });
          }
        }

        // Process streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let assistantMessage = "";
        const assistantMessageId = (Date.now() + 1).toString();
        let assistantMessageCreated = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim() || !line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") break;

              try {
                const data = JSON.parse(jsonStr);
                if (data.type === "text-delta" && data.delta) {
                  assistantMessage += data.delta;

                  if (!assistantMessageCreated) {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: assistantMessageId,
                        role: "assistant",
                        parts: [{ type: "text", text: assistantMessage }],
                        txSignature: currentTxSignature,
                      },
                    ]);
                    assistantMessageCreated = true;
                    // Set status to idle once assistant message starts appearing
                    setStatus("idle");
                  } else {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? {
                              ...msg,
                              parts: [{ type: "text", text: assistantMessage }],
                              txSignature: currentTxSignature,
                            }
                          : msg
                      )
                    );
                  }
                }
              } catch (e) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }
        } catch (error) {
          throw error;
        }
      } catch (err) {
        console.error("Chat error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
        setPaymentInfo({
          amount: "$0.1",
          signature: undefined,
          status: null,
        });
      }
    },
    [account, signer, messages]
  );

  return {
    messages,
    sendMessage,
    status,
    error,
    paymentInfo,
  };
}
