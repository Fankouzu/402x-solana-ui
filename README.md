# x402 Solana AI Chat

一个 Next.js 应用，落实 **x402 protocol**——用于区块链微支付的 HTTP 402 Payment Required 标准。本项目演示了依托 Solana USDC 支付的按消息计费 AI 聊天体验，用户可以在每次与 AI 交互时实时付款。

## 功能

### 💰 x402 Protocol 集成
- **x402 Standard**：实现面向区块链微支付的 HTTP 402 Payment Required 协议
- **Solana USDC Payments**：在 Solana Devnet 上使用 USDC 完成极速支付
- **Local Keypair Management**：安全生成与管理 Solana 密钥对
- **Wallet Integration**：无缝连接 Solana 钱包（Phantom、Solflare 等）
- **Real-time Balance Display**：实时更新 USDC 余额，并支持手动刷新

### 🤖 AI Chat 界面
- **Pay-per-message**：通过 x402 protocol 为每条消息支付 0.1 美元 USDC
- **Streaming Responses**：实时流式返回 AI 回复
- **Balance Validation**：请求前预检余额以确保资金充足
- **Payment Confirmation**：直观展示成功的 x402 支付
- **Transaction Transparency**：持久化交易签名并提供 Solscan 链接

### 🔐 安全与体验
- **Insufficient Funds Protection**：当余额不足时阻止请求
- **Payment Status Tracking**：展示 processing → completed → confirmed 状态流转
- **Error Handling**：平滑处理支付失败场景
- **Transaction Verification**：提供指向 Solscan 的交易验证链接

### 🎨 现代化 UI/UX
- **Responsive Design**：适配桌面端与移动端
- **Dark/Light Theme Support**：保持简洁现代的深浅色主题
- **Real-time Updates**：余额与支付状态自动刷新
- **Professional Payment Display**：紧凑且信息完备的支付确认视图

## 技术栈

- **Frontend**：Next.js 15 + TypeScript
- **Styling**：Tailwind CSS 与 Solana 主题化组件
- **Blockchain**：Solana（Devnet）
- **Payment Protocol**：x402 - HTTP 402 Payment Required 标准
- **Wallet**：Solana Wallet Standard 集成
- **AI**：GPT-4 流式响应
- **Payment Libraries**：x402-fetch、x402-next middleware

## 项目结构

```
├── app/
│   ├── api/chat/           # 带支付中间件的 AI 聊天 API 端点
│   ├── hooks/              # 自定义 React hooks
│   │   └── useProtectedChat.ts    # 受支付保护的聊天逻辑
│   ├── utils/              # 工具函数
│   │   ├── keypair.ts      # 本地密钥对管理
│   │   └── index.ts        # Solana 工具（余额、转账）
│   ├── page.tsx            # 主聊天界面
│   └── WalletContext.tsx   # 钱包连接上下文
├── components/             # 可复用 UI 组件
│   ├── USDCBalance.tsx     # 余额展示组件
│   ├── TransferModal.tsx   # USDC 转账界面
│   ├── ConnectWalletBtn.tsx # 钱包连接按钮
│   └── ...
├── middleware.ts           # x402 支付中间件配置
└── lib/                    # 工具库
```

## 核心组件

### Payment Middleware (`middleware.ts`)
为受保护的路由实现 HTTP 402 Payment Required：
- `/api/chat` - 每条消息 0.1 美元
- 支付校验与处理
- 生成交易签名

### useProtectedChat Hook (`app/hooks/useProtectedChat.ts`)
管理完整的 x402 支付 → 聊天流程：
- 请求前余额校验
- 集成 x402 protocol 的支付处理
- 流式响应处理与交易签名存储
- 端到端的错误管理与恢复

### USDC Balance 管理 (`components/USDCBalance.tsx`)
实时展示余额：
- 从 Solana Devnet 获取余额
- 交易完成后自动刷新
- 显示加载状态

### Transfer 系统 (`components/TransferModal.tsx`)
完成 USDC 转账：
- 将资金从已连接钱包转入本地密钥对
- 交易确认反馈
- 触发余额刷新

## 快速开始

### 先决条件
- Node.js 18+ 与 pnpm
- Solana 钱包（Phantom、Solflare 等）
- Solana Devnet 上的 USDC（可通过水龙头获取）

### 安装

```bash
# 克隆仓库
git clone https://github.com/Fankouzu/402x-solana-ui
cd 402x-solana-ui

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 使用指南

1. **Connect Wallet**：点击“Connect Wallet”连接 Solana 钱包
2. **Generate Local Keypair**：生成用于支付的本地密钥对
3. **Transfer USDC**：将 USDC 从钱包转入本地密钥对
4. **Start Chatting**：向 AI 发送消息（每条消耗 0.1 美元 USDC）
5. **View Transactions**：点击交易签名在 Solscan 查看详情

### 配置

支付中间件位于 `middleware.ts`：
- **Resource Wallet**：`Du3X3wKN3LHfSbXtX2PW5jhnSHit8j8NSb19VZW6V9mu`
- **Network**：`solana-devnet`
- **Price per message**：`$0.1`

## 支付流程

1. **Balance Check**：校验 USDC 余额是否满足 0.1 美元
2. **Payment Processing**：创建并签署支付交易
3. **API Request**：携带支付头信息发起聊天请求
4. **Transaction Confirmation**：接收交易签名
5. **Balance Update**：支付成功后刷新余额

## 安全特性

- **Pre-flight Balance Validation**：防止余额不足的请求
- **Local Keypair Security**：私钥仅存储在本地，绝不上传
- **Payment Verification**：所有交易可在 Solana 区块链上验证
- **Error Handling**：优雅处理支付失败

## 开发

### 关键依赖
- `@solana/kit` - Solana 区块链交互
- `x402-next` - HTTP 402 中间件
- `x402-fetch` - 支付能力增强的 fetch 封装
- `gill` - Solana 工具与探索器链接

### 环境配置
应用默认使用 Solana Devnet。基础功能无需额外环境变量。

## 贡献

1. Fork 仓库
2. 创建特性分支（`git checkout -b feature/amazing-feature`）
3. 提交改动（`git commit -m 'Add amazing feature'`）
4. 推送分支（`git push origin feature/amazing-feature`）
5. 发起 Pull Request

## 许可证

本项目采用 MIT license。

## 链接

- **Repository**: https://github.com/Fankouzu/402x-solana-ui
- **Solana Devnet Explorer**: https://explorer.solana.com/?cluster=devnet
- **USDC Devnet Mint**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

---

基于 Next.js 与 Solana 构建 ❤️
