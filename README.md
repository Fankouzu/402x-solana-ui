# 402x Solana UI

A Next.js application that demonstrates HTTP 402 Payment Required implementation using Solana blockchain for micro-payments. This app showcases pay-per-use AI chat functionality where users pay USDC for each AI interaction.

## Features

### 💰 Crypto Payment Integration
- **HTTP 402 Payment Required**: Implements the x402 protocol for micro-payments
- **Solana USDC Payments**: Uses USDC on Solana Devnet for transactions
- **Local Keypair Management**: Generates and manages local Solana keypairs
- **Wallet Integration**: Connects to Solana wallets (Phantom, Solflare, etc.)
- **Real-time Balance Display**: Shows USDC balance in the header

### 🤖 AI Chat Interface
- **Pay-per-message**: Each chat message costs $0.01 USDC
- **Streaming Responses**: Real-time streaming of AI responses
- **Balance Validation**: Pre-flight checks to ensure sufficient funds
- **Payment Confirmation**: Visual confirmation of successful payments
- **Transaction Transparency**: Clickable transaction signatures with explorer links

### 🔐 Security & User Experience
- **Insufficient Funds Protection**: Prevents requests when balance is too low
- **Payment Status Tracking**: Shows processing → completed → confirmed states
- **Error Handling**: Graceful handling of payment failures
- **Transaction Verification**: Links to Solscan explorer for transaction details

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme Support**: Clean, modern interface
- **Real-time Updates**: Balance and payment status update automatically
- **Professional Payment Display**: Compact, informative payment confirmations

## Technical Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Blockchain**: Solana (Devnet)
- **Payment Protocol**: x402 HTTP Payment Required
- **Wallet**: Solana Wallet Standard integration
- **AI**: Streaming chat responses (configurable backend)

## Project Structure

```
├── app/
│   ├── api/chat/           # AI chat API endpoint with payment middleware
│   ├── hooks/              # Custom React hooks
│   │   └── useProtectedChat.ts    # Payment-protected chat functionality
│   ├── utils/              # Utility functions
│   │   ├── keypair.ts      # Local keypair management
│   │   └── index.ts        # Solana utilities (balance, transfers)
│   ├── page.tsx            # Main chat interface
│   └── WalletContext.tsx   # Wallet connection context
├── components/             # Reusable UI components
│   ├── USDCBalance.tsx     # Balance display component
│   ├── TransferModal.tsx   # USDC transfer interface
│   ├── ConnectWalletBtn.tsx # Wallet connection button
│   └── ...
├── middleware.ts           # x402 payment middleware configuration
└── lib/                    # Utility libraries
```

## Key Components

### Payment Middleware (`middleware.ts`)
Implements HTTP 402 Payment Required for protected routes:
- `/api/chat` - $0.01 per message
- Payment validation and processing
- Transaction signature generation

### useProtectedChat Hook (`app/hooks/useProtectedChat.ts`)
Manages the entire payment → chat flow:
- Balance validation before requests
- Payment processing with x402 protocol
- Streaming response handling
- Error management

### USDC Balance Management (`components/USDCBalance.tsx`)
Real-time balance display:
- Fetches balance from Solana devnet
- Auto-refreshes after transactions
- Shows loading states

### Transfer System (`components/TransferModal.tsx`)
Facilitates USDC transfers:
- Transfer from connected wallet to local keypair
- Transaction confirmation
- Balance refresh triggers

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Solana wallet (Phantom, Solflare, etc.)
- USDC on Solana Devnet (can be obtained from faucets)

### Installation

```bash
# Clone the repository
git clone https://github.com/pratikbuilds/402x-solana-ui.git
cd 402x-solana-ui

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your Solana wallet
2. **Generate Local Keypair**: Create a local keypair for payments
3. **Transfer USDC**: Transfer USDC from your wallet to the local keypair
4. **Start Chatting**: Send messages to the AI (costs $0.01 USDC each)
5. **View Transactions**: Click transaction signatures to view on Solscan

### Configuration

The payment middleware is configured in `middleware.ts`:
- **Resource Wallet**: `Du3X3wKN3LHfSbXtX2PW5jhnSHit8j8NSb19VZW6V9mu`
- **Network**: `solana-devnet`
- **Price per message**: `$0.01`

## Payment Flow

1. **Balance Check**: Validates sufficient USDC balance ($0.01 minimum)
2. **Payment Processing**: Creates and signs payment transaction
3. **API Request**: Sends payment header with chat request
4. **Transaction Confirmation**: Receives transaction signature
5. **Balance Update**: Refreshes balance after successful payment

## Security Features

- **Pre-flight Balance Validation**: Prevents insufficient fund requests
- **Local Keypair Security**: Private keys stored locally, never transmitted
- **Payment Verification**: All transactions verifiable on Solana blockchain
- **Error Handling**: Graceful handling of payment failures

## Development

### Key Dependencies
- `@solana/kit` - Solana blockchain interactions
- `x402-next` - HTTP 402 middleware
- `x402-fetch` - Payment-enabled fetch wrapper
- `gill` - Solana utilities and explorer links

### Environment Setup
The application uses Solana Devnet by default. No additional environment variables required for basic functionality.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is MIT licensed.

## Links

- **Repository**: https://github.com/pratikbuilds/402x-solana-ui
- **Solana Devnet Explorer**: https://explorer.solana.com/?cluster=devnet
- **USDC Devnet Mint**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

---

Built with ❤️ using Next.js and Solana