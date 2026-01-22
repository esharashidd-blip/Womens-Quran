import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CoachMessage } from "./storage";

const ISLAMIC_COACH_SYSTEM_PROMPT = `You are a warm Islamic life coach for Muslim women. Be brief and supportive.

RULES:
- 2-3 sentences max unless asked for more
- Validate feelings, ask one question or give one tip
- No fatwas, defer to scholars. No medical/legal/financial advice
- Plain text only, no markdown or special characters
- Natural, conversational tone like texting a friend`;

// Daily token limit per user (50,000 tokens)
export const DAILY_TOKEN_LIMIT = 50000;

let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface ChatResponse {
  content: string;
  tokensUsed: number;
}

export async function sendCoachMessage(
  userMessage: string,
  conversationHistory: CoachMessage[],
  userName?: string
): Promise<ChatResponse> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // Build the conversation history for context
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  // Add conversation history
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  // Add the new user message
  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  // Build the system prompt with user's name if available
  let systemPrompt = ISLAMIC_COACH_SYSTEM_PROMPT;
  if (userName) {
    // Only use the first word of the name
    const firstName = userName.split(/\s+/)[0];
    systemPrompt += `\n\nUser's name is ${firstName}. Use it occasionally.`;
  }

  // Start a chat with the system instruction
  const chat = model.startChat({
    history: contents.slice(0, -1), // All messages except the last one
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
  });

  // Send the latest message
  const result = await chat.sendMessage(userMessage);
  const response = result.response;

  // Get token usage from the response metadata
  const usageMetadata = response.usageMetadata;
  const tokensUsed = (usageMetadata?.promptTokenCount || 0) + (usageMetadata?.candidatesTokenCount || 0);

  // Get and clean the response content
  let content = response.text() || "";
  content = cleanResponseContent(content);

  // Handle empty responses
  if (!content.trim()) {
    content = "I'm here for you, sister. Could you share a bit more about what's on your mind? I want to make sure I can offer you the support you need.";
  }

  return {
    content,
    tokensUsed,
  };
}

/**
 * Clean up the AI response content for better readability
 */
function cleanResponseContent(content: string): string {
  return content
    // Replace em dashes with regular dashes or appropriate punctuation
    .replace(/—/g, " - ")
    // Replace en dashes
    .replace(/–/g, "-")
    // Clean up multiple spaces
    .replace(/  +/g, " ")
    // Clean up spaces before punctuation
    .replace(/ ([.,!?;:])/g, "$1")
    .trim();
}

export function generateConversationTitle(firstMessage: string): string {
  // Generate a short title from the first message
  const words = firstMessage.split(/\s+/).slice(0, 5);
  let title = words.join(" ");
  if (firstMessage.split(/\s+/).length > 5) {
    title += "...";
  }
  return title.substring(0, 50);
}
