import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log("Messages", JSON.stringify(messages));
  const result = streamText({
    model: openai("gpt-4.1-mini-2025-04-14"),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
