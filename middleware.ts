import { paymentMiddleware, Resource, Network } from "x402-next";
import { NextRequest, NextResponse } from "next/server";
import { Address } from "@solana/kit";

// Validate environment variables
const resourceWalletAddress = "2exSLPEPuvcwxTnbooRUo7NHhAKhDZLh36nyDgDKHYiS";
const network = "solana-devnet";

console.log("Middleware loaded!");
console.log(
  "RESOURCE_WALLET_ADDRESS:",
  resourceWalletAddress ? "✓ Set" : "✗ Missing"
);
console.log("NETWORK:", network ? "✓ Set" : "✗ Missing");

let solanax402PaymentMiddleware: any = null;

const address = resourceWalletAddress as Address;
solanax402PaymentMiddleware = paymentMiddleware(
  address,
  {
    "/api/protected": {
      price: "$0.01",
      config: {
        description: "Access to protected content",
      },
      network: network as Network,
    },
    "/api/chat": {
      price: "$0.01",
      config: {
        description: "Access to AI chat model",
      },
      network: network as Network,
    },
  },
  {
    url: "https://facilitator.payai.network",
  }
);
console.log("✅ Payment middleware initialized successfully");

export default async function middleware(request: NextRequest) {
  console.log("Middleware executed for:", request.nextUrl.pathname);

  // If middleware wasn't initialized due to missing env vars, skip payment processing
  if (!solanax402PaymentMiddleware) {
    console.log("Skipping payment processing - middleware not initialized");
    return NextResponse.next();
  }

  // run middleware for all api routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    console.log("Processing API request with payment middleware");
    return solanax402PaymentMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
  runtime: "nodejs",
};
