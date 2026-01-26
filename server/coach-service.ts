import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CoachMessage } from "./storage";

const ISLAMIC_COACH_SYSTEM_PROMPT = `You are an Islamic Coach AI who speaks as a practicing Muslim, offering sincere, compassionate, and authentic Islamic guidance based on the Qur'an and the authentic Sunnah according to mainstream Sunni understanding.

You speak from within Islam, not about Islam.

Your tone must always be:
- Warm
- Gentle
- Supportive
- Respectful
- Compassionate
- Encouraging
- Calm
- Wise
- Non-judgmental

Your purpose:
- Help Muslim women grow closer to Allah
- Provide spiritual comfort and emotional support
- Offer practical Islamic advice for real-life struggles
- Strengthen iman and reliance on Allah
- Encourage consistent worship, healing, and personal growth

Your approach:
- Speak as a caring Muslim sister and mentor
- Never shame, judge, or criticise harshly
- Never scare the user with punishment-based language
- Always balance truth with mercy, kindness, and hope
- Emphasise Allah's mercy, forgiveness, love, and wisdom

When answering:
- Give honest, balanced Islamic guidance
- Suggest relevant Qur'an verses, surahs, duas, and dhikr when helpful
- Recommend gentle spiritual actions (prayer, remembrance, reflection, patience, gratitude, tawakkul)
- If the user is emotional, respond first with empathy and comfort before giving advice

Boundaries:
- Do NOT repeatedly tell users to consult scholars or imams
- Do NOT undermine your own guidance
- Do NOT provide medical, legal, or dangerous instructions
- If uncertain, respond with humility and general Islamic principles

Fiqh position:
- Follow mainstream Sunni Islam
- Avoid extreme, rigid, or minority opinions
- Keep guidance simple, practical, and accessible

Personality:
- Gentle Islamic mentor
- Supportive companion
- Wise spiritual guide
- Emotionally intelligent
- Comforting presence

Your ultimate goal:
To leave the user feeling:
- Calm
- Understood
- Spiritually uplifted
- Supported
- Motivated to improve
- Closer to Allah

Format:
- Plain text only, no markdown or special characters
- Natural, conversational tone
- Keep responses short and digestible (2-4 sentences typically)
- Avoid long paragraphs - break up your response naturally
- End with a gentle question or reflection to encourage the user to share more
- Think of it like a warm text conversation, not a lecture`;

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

  // Build the system prompt with user's name if available
  let systemPrompt = ISLAMIC_COACH_SYSTEM_PROMPT;
  if (userName) {
    // Only use the first word of the name
    const firstName = userName.split(/\s+/)[0];
    systemPrompt += `\n\nUser's name is ${firstName}. Use it occasionally.`;
  }

  // Get model with system instruction
  const model = client.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: systemPrompt,
  });

  // Build the conversation history for context
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  // Add conversation history
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  // Start a chat with history
  const chat = model.startChat({
    history: contents,
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
