// import { TransactionSendingSigner, TransactionSigner } from "@solana/kit";
// import { PaymentPayload, PaymentRequirements } from "x402/types";

import { Address, airdropFactory, TransactionSigner } from "@solana/kit";

// /**
//  * Creates and encodes a payment header for the given client and payment requirements.
//  *
//  * @param client - The signer instance used to create the payment header
//  * @param x402Version - The version of the X402 protocol to use
//  * @param paymentRequirements - The payment requirements containing scheme and network information
//  * @returns A promise that resolves to a base64 encoded payment header string
//  */
// export async function createPaymentHeader(
//   client: TransactionSendingSigner,
//   x402Version?: number,
//   paymentRequirements?: PaymentRequirements
// ): Promise<string> {
//   //   const paymentPayload = await createAndSignPayment(
//   //     client,
//   //     x402Version,
//   //     paymentRequirements
//   //   );
//   //   return encodePayment(paymentPayload);
//   return "Hel";
// }

// /**
//  * Creates and signs a payment for the given client and payment requirements.
//  *
//  * @param client - The signer instance used to create and sign the payment tx
//  * @param x402Version - The version of the X402 protocol to use
//  * @param paymentRequirements - The payment requirements
//  * @returns A promise that resolves to a payment payload containing a base64 encoded solana token transfer tx
//  */
// export async function createAndSignPayment(
//   client: TransactionSendingSigner,
//   x402Version: number,
//   paymentRequirements: PaymentRequirements
// ): Promise<PaymentPayload> {
//   const transactionMessage = await createTransferTransactionMessage(
//     client,
//     paymentRequirements
//   );
//   const signedTransaction = await partiallySignTransactionMessageWithSigners(
//     transactionMessage
//   );
//   const base64EncodedWireTransaction =
//     getBase64EncodedWireTransaction(signedTransaction);

//   // return payment payload
//   return {
//     scheme: paymentRequirements.scheme,
//     network: paymentRequirements.network,
//     x402Version: x402Version,
//     payload: {
//       transaction: base64EncodedWireTransaction,
//     },
//   } as PaymentPayload;
// }
import {
  address,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  devnet,
  lamports,
} from "@solana/kit";
import {
  createSolanaClient,
  createTransaction,
  getBase58Decoder,
  getExplorerLink,
  getSignatureFromTransaction,
  KeyPairSigner,
  signAndSendTransactionMessageWithSigners,
  signTransactionMessageWithSigners,
} from "gill";
import { loadKeypairSignerFromFile } from "gill/node";
import {
  getAssociatedTokenAccountAddress,
  getCreateAssociatedTokenIdempotentInstruction,
  getTransferInstruction,
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
  tokenAmountToUiAmount,
  decodeToken,
} from "gill/programs";
import {
  assertAccountExists,
  assertIsAddress,
  fetchEncodedAccount,
} from "gill";
import { config } from "process";

const devnetUSDCMint = address("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const tokenProgram = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

export async function airdropDevnetSol(address: Address) {
  const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com "));
  const rpcSubscriptions = createSolanaRpcSubscriptions(
    devnet("https://api.devnet.solana.com ")
  );

  const airdrop = airdropFactory({ rpc, rpcSubscriptions });

  await airdrop({
    commitment: "confirmed",
    recipientAddress: address,
    lamports: lamports(10_000_000n),
  });
}

export async function getDevnetSOLCBalance(address: Address) {
  const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com "));
  const balance = await rpc.getBalance(address);
  return balance;
}

export async function getDevnetUSDCBalance(address: Address) {
  const ata = await getAssociatedTokenAccountAddress(devnetUSDCMint, address);

  const { rpc } = createSolanaClient({
    urlOrMoniker: "devnet", // or `mainnet`, `localnet`, etc
  });
  assertIsAddress(ata);
  const account = await fetchEncodedAccount(rpc, ata);
  assertAccountExists(account);
  const tokenAccountData = decodeToken(account);

  return tokenAmountToUiAmount(tokenAccountData.data.amount, 6);
}

// tokenAmountToUiAmount

export async function transferDevnetUSDC(
  signer: TransactionSigner,
  to: Address,
  amount: number
) {
  const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: "devnet", // or `mainnet`, `localnet`, etc
  });
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const destinationAta = await getAssociatedTokenAccountAddress(
    devnetUSDCMint,
    to
  );
  const sourceAta = await getAssociatedTokenAccountAddress(
    devnetUSDCMint,
    signer.address
  );

  const transaction = createTransaction({
    feePayer: signer,
    version: "legacy",
    instructions: [
      // create idempotent will gracefully fail if the ata already exists. this is the gold standard!
      getCreateAssociatedTokenIdempotentInstruction({
        mint: devnetUSDCMint,
        payer: signer,
        owner: to,
        ata: destinationAta,
        tokenProgram: tokenProgram,
      }),
      getTransferInstruction(
        {
          source: sourceAta,
          authority: signer,
          destination: destinationAta,
          amount: BigInt(Math.floor(amount * 1_000_000)), // Convert USDC to smallest unit (6 decimals)
        },
        {
          programAddress: tokenProgram,
        }
      ),
    ],
    latestBlockhash,
  });

  const signatureBytes = await signAndSendTransactionMessageWithSigners(
    transaction
  );
  const signature = getBase58Decoder().decode(signatureBytes);
  console.log(signature);
  console.log(
    "Explorer:",
    getExplorerLink({
      cluster: "devnet",
      transaction: signature,
    })
  );
}
