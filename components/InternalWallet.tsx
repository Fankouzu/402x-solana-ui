"use client";

import { useState } from "react";
import { useKeypairStore } from "../app/utils/keypair";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Copy, Key, Trash2, Plus } from "lucide-react";

export function InternalWallet() {
  const { publicKey, hasKeypair, signer, generateKeypair, clearKeypair } =
    useKeypairStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleGenerateKeypair = async () => {
    await generateKeypair();
    setIsDialogOpen(false);
  };

  const handleClearKeypair = () => {
    clearKeypair();
    setIsDialogOpen(false);
  };

  if (!hasKeypair) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            生成钱包
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>生成内部钱包</DialogTitle>
            <DialogDescription>
              这会创建一个新的 Solana 密钥对，并保存在你的浏览器本地。
              <br />
              <span className="text-orange-600 font-medium">
                警告：仅用于开发或测试，切勿存放真实资金。
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button onClick={handleGenerateKeypair}>
              <Key className="w-4 h-4 mr-2" />
              生成密钥对
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Format the address to show first 4 and last 4 characters
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono text-xs">
          <Key className="w-4 h-4 mr-2" />
          {formatAddress(publicKey || '')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>内部钱包</DialogTitle>
          <DialogDescription>
            你在本地保存的 Solana 密钥对
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Public Key */}
          <div>
            <label className="text-sm font-medium">公钥（地址）</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-muted rounded text-xs font-mono">
                {publicKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(publicKey || "")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Signer Status */}
          <div>
            <label className="text-sm font-medium">签名者状态</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-muted rounded text-xs">
                {signer
                  ? "✅ 内存中已加载签名者"
                  : "⚠️ 未加载签名者（请刷新）"}
              </code>
            </div>
          </div>

          {/* Warning */}
          {/* <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Security Warning:</strong> This keypair is stored unencrypted in localStorage. 
              Only use for development and testing. Never store real funds here.
            </p>
          </div> */}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearKeypair}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              删除钱包
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              关闭
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
