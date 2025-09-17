import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // This route is protected by the payment middleware
  return NextResponse.json({
    message: "Welcome to the protected API!",
    data: {
      secret: "This is premium content",
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
    },
    status: "success",
  });
}
