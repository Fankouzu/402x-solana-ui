"use client";

import { useState, useRef, useEffect, forwardRef } from "react";
import { useWallet } from "./WalletContext";
import { ConnectWalletBtn } from "@/components/ConnectWalletBtn";
import { WalletInfo } from "@/components/WalletInfo";
import { InternalWallet } from "@/components/InternalWallet";
import { TransferModal } from "@/components/TransferModal";
import { ProtectedButton } from "@/app/ProtectedButton";
import { useProtectedChat } from "./hooks/useProtectedChat";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import {
  MessageCircle,
  Send,
  AlertTriangle,
  ExternalLink,
  type LucideProps,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { USDCBalance, type USDCBalanceHandle } from "@/components/USDCBalance";
import { getExplorerLink } from "gill";
import { cn } from "@/lib/utils";

const FaucetIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, ...props }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-faucet-icon lucide-faucet"><path d="M10.22 4.9 5.4 6H5a2 2 0 0 1 0-4h.4l4.86 1" /><circle cx="12" cy="4" r="2" /><path d="m13.78 4.9 4.8 1h.4a2 2 0 0 0 0-4h-.4l-4.92 1" /><path d="M12 6v3" /><rect width="4" height="6" x="18" y="10" /><path d="M22 9v8" /><path d="M18 11h-2.6a3.87 3.87 0 0 0-6.8 0H7c-2.8 0-5 2.2-5 5v1h4v-1c0-.6.4-1 1-1h1.6a3.87 3.87 0 0 0 6.8 0H18" /><path d="M3.5 17S2 19 2 20a2 2 0 0 0 4 0c0-1-1.5-3-1.5-3" /></svg>
  )
);

FaucetIcon.displayName = "FaucetIcon";

export default function Home() {
  const { isConnected } = useWallet();
  const [input, setInput] = useState("");
  const usdcBalanceRef = useRef<USDCBalanceHandle>(null);
  const lastRefreshStatus = useRef<string>("idle");

  const { messages, sendMessage, status, error, paymentInfo } =
    useProtectedChat();

  // Refresh balance after successful chat responses (only when status changes to idle)
  useEffect(() => {
    // Only refresh when status changes from loading to idle and we have messages
    if (
      status === "idle" &&
      lastRefreshStatus.current === "loading" &&
      messages.length > 0
    ) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "assistant") {
        usdcBalanceRef.current?.refresh();
      }
    }
    lastRefreshStatus.current = status;
  }, [status, messages]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage({
      text: message.text || input,
      files: message.files || [],
    });
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <img src="/header.png" alt="Solana" className="w-8 h-8" />
          <div>
            <h1 className="font-semibold text-lg text-foreground">
              Solana AI Chat
            </h1>
            <p className="text-xs text-muted-foreground">
              按条计费（使用USDC）• 闪电般快速
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <USDCBalance ref={usdcBalanceRef} />
          <Button
            variant="outline"
            size="icon"
            aria-label="打开水龙头领取测试资金"
            onClick={() => window.open("https://faucet.circle.com/", "_blank", "noopener,noreferrer")}
          >
            <FaucetIcon className="w-4 h-4" />
          </Button>
          <InternalWallet />
          {isConnected && (
            <TransferModal
              onTransferComplete={() => usdcBalanceRef.current?.refresh()}
            >
              <Button variant="outline" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Transfer USDC
              </Button>
            </TransferModal>
          )}
          {/* {isConnected && <ProtectedButton />} */}
          {/* {!isConnected ? <ConnectWalletBtn /> : <WalletInfo />} */}
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages Area */}
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <MessageCircle className="size-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Welcome to Solana AI Chat! 🚀
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  由Solana支付提供支持的人工智能助手！每条消息仅需0.01美元的USDC。有什么问题尽管问——让我们找点乐子吧！✨
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                  <button
                    onClick={() =>
                      setInput(
                        "用五岁小孩能听懂的简单语言解释一下索拉纳（Solana）是什么"
                      )
                    }
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all transform hover:scale-105"
                  >
                    🧒 Solana 入门
                  </button>
                  <button
                    onClick={() =>
                      setInput("如果人工智能接管了世界，会发生什么？")
                    }
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full transition-all transform hover:scale-105"
                  >
                    🤖 AI 接管世界
                  </button>
                  <button
                    onClick={() =>
                      setInput("给我讲一个关于 Solana 的有趣笑话")
                    }
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full transition-all transform hover:scale-105"
                  >
                    😂 Solana 笑话
                  </button>

                  <button
                    onClick={() =>
                      setInput(
                        "解释为什么猫会成为糟糕的迷因币投资者"
                      )
                    }
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full transition-all transform hover:scale-105"
                  >
                    🐱 猫咪大战加密
                  </button>
                  <button
                    onClick={() =>
                      setInput(
                        "如果用披萨代替美元作为货币会怎样？"
                      )
                    }
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-full transition-all transform hover:scale-105"
                  >
                    🍕 披萨经济
                  </button>
                  <button
                    onClick={() =>
                      setInput(
                        "为什么 Solana 比我奶奶的网络还要快？"
                      )
                    }
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full transition-all transform hover:scale-105"
                  >
                    👵 奶奶的网络
                  </button>
                  <button
                    onClick={() =>
                      setInput(
                        "编一个关于 Solana 接管世界的阴谋论或传说！"
                      )
                    }
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full transition-all transform hover:scale-105"
                  >
                    🕵️ Solana 阴谋论
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto px-4 space-y-6">
                {messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
                          AI
                        </div>
                      </div>
                    )}

                    <div
                      className={`flex flex-col max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"
                        }`}
                    >
                      {message.parts.map((part: any, i: number) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <div
                                key={`${message.id}-${i}`}
                                className={`rounded-2xl px-4 py-3 shadow-sm ${message.role === "user"
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-secondary text-secondary-foreground rounded-bl-md"
                                  }`}
                              >
                                <Response className="text-sm">
                                  {part.text}
                                </Response>
                              </div>
                            );
                          default:
                            return null;
                        }
                      })}

                      <div className="text-xs text-muted-foreground mt-1 px-2">
                        {message.role === "assistant" ? "AI Assistant" : "You"}{" "}
                        • now
                      </div>

                      {/* Show transaction signature for assistant messages */}
                      {message.role === "assistant" && message.txSignature && (
                        <div className="flex items-center gap-2 mt-2 px-2">
                          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
                            <img
                              src="/solana.png"
                              alt="Solana"
                              className="w-3 h-3"
                            />
                            <span className="font-medium">Paid with USDC</span>
                            <span className="font-mono">$0.01</span>
                            <span className="text-gray-400">•</span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  navigator.clipboard.writeText(
                                    message.txSignature || ""
                                  )
                                }
                                className="font-mono hover:underline text-green-600"
                                title="Click to copy transaction signature"
                              >
                                {message.txSignature.slice(0, 4)}...
                                {message.txSignature.slice(-4)}
                              </button>
                              <a
                                href={getExplorerLink({
                                  cluster: "devnet",
                                  transaction: message.txSignature,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-green-100 rounded text-green-600"
                                title="View transaction on Solscan"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-medium text-xs">
                          U
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Show loading component only when loading */}
                {status === "loading" && (
                  <div className="max-w-4xl mx-auto px-4 space-y-6">
                    {/* Chat Loading */}
                    <div className="flex gap-4 justify-start">
                      {/* AI Avatar */}
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
                          AI
                        </div>
                      </div>

                      {/* Loading Message */}
                      <div className="flex flex-col max-w-[85%] items-start">
                        <div className="rounded-2xl px-4 py-3 shadow-sm bg-secondary text-secondary-foreground rounded-bl-md">
                          <div className="flex items-center gap-2">
                            {/* Typing dots animation */}
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                              <div
                                className="w-2 h-2 bg-current rounded-full animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-current rounded-full animate-pulse"
                                style={{ animationDelay: "0.4s" }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {paymentInfo.status === "processing"
                                ? "Processing payment..."
                                : "AI is thinking..."}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground mt-1 px-2">
                          AI Assistant •{" "}
                          {paymentInfo.status === "processing"
                            ? "processing payment"
                            : "typing..."}
                        </div>
                      </div>
                    </div>

                    {/* Payment Processing Info */}
                    {paymentInfo.status &&
                      paymentInfo.status !== "processing" && (
                        <div className="flex gap-4 justify-center">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${paymentInfo.status === "error"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-green-50 text-green-700 border-green-200"
                              }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${paymentInfo.status === "error"
                                ? "bg-red-400"
                                : "bg-green-400"
                                }`}
                            ></div>
                            <span className="font-medium">
                              Payment{" "}
                              {paymentInfo.status === "error"
                                ? "Failed"
                                : "Confirmed"}
                            </span>
                            <span className="font-mono">
                              {paymentInfo.amount}
                            </span>
                            {paymentInfo.signature && (
                              <>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        paymentInfo.signature || ""
                                      )
                                    }
                                    className={`font-mono hover:underline ${paymentInfo.status === "error"
                                      ? "text-red-600"
                                      : "text-green-600"
                                      }`}
                                    title="Click to copy transaction signature"
                                  >
                                    {paymentInfo.signature.slice(0, 4)}...
                                    {paymentInfo.signature.slice(-4)}
                                  </button>
                                  <a
                                    href={getExplorerLink({
                                      cluster: "devnet",
                                      transaction: paymentInfo.signature,
                                    })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-1 hover:bg-gray-100 rounded ${paymentInfo.status === "error"
                                      ? "text-red-600"
                                      : "text-green-600"
                                      }`}
                                    title="View transaction on Solscan"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input Area */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputTextarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask me anything..."
                  className="min-h-[50px] text-sm resize-none"
                />
                <PromptInputToolbar>
                  <PromptInputTools>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      Press Enter to send, Shift+Enter for new line
                    </span>
                  </PromptInputTools>
                  <PromptInputSubmit
                    status={status === "loading" ? "streaming" : undefined}
                    disabled={status === "loading" || !input.trim()}
                  />
                </PromptInputToolbar>
              </PromptInputBody>
            </PromptInput>

            {status === "loading" && (
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-current rounded-full animate-pulse"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-current rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span>Processing request...</span>
              </div>
            )}

            {error && (
              <div
                className={`mt-3 p-3 rounded-md text-sm border ${error.includes("Insufficient USDC balance")
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-red-50 text-red-700 border-red-200"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {error.includes("Insufficient USDC balance") && (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <div>
                    <strong>
                      {error.includes("Insufficient USDC balance")
                        ? "Insufficient Funds:"
                        : "Error:"}
                    </strong>{" "}
                    {error}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
