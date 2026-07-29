import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversationMessages, conversations, memories, preferences } from "@/db/schema";
import { auth } from "@/lib/auth";

type ChatRole = "system" | "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ProviderResult = {
  content: string;
  model: string;
  provider: "openrouter" | "google";
};

const systemPrompt =
  "You are MasterAI, a deeply personalized learning, career, and execution assistant. Use the supplied profile and retrieved context as first-class guidance. Give answers that fit the user's role, goals, level, interests, preferred tone, constraints, and current conversation. Be specific, practical, and direct. If the user asks for a plan, produce concrete steps. If the user asks something technical, adapt depth to their learning level and include examples.";

const openRouterModel = process.env.OPENROUTER_MODEL || "openrouter/free";
const googleModel = process.env.GOOGLE_MODEL || "gemini-3.5-flash";

const genericChatError =
  "MasterAI could not complete that request. Check the API keys or try again in a moment.";

function getGoogleApiKey() {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
}

function makeTitle(content: string) {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= 72) {
    return compact || "New conversation";
  }

  return `${compact.slice(0, 69)}...`;
}

function tokenize(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2),
  );
}

function scoreText(queryTerms: Set<string>, text: string) {
  const terms = tokenize(text);
  let score = 0;

  queryTerms.forEach((term) => {
    if (terms.has(term)) score += 2;
    if (text.toLowerCase().includes(term)) score += 1;
  });

  return score;
}

async function buildPersonalizedContext(userId: string, userName: string, query: string) {
  const [preference] = await db
    .select()
    .from(preferences)
    .where(eq(preferences.userId, userId))
    .limit(1);

  const savedMemories = await db
    .select()
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(desc(memories.updatedAt))
    .limit(40);

  const queryTerms = tokenize(query);
  const rankedMemories = savedMemories
    .map((memory) => ({
      memory,
      score: scoreText(queryTerms, `${memory.key} ${memory.value}`),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ memory }) => `- ${memory.key}: ${memory.value}`);

  const profileLines = [
    `Name: ${userName}`,
    `Profession/current role: ${preference?.profession || "Not configured"}`,
    `Learning level: ${preference?.learningLevel || "Not configured"}`,
    `Preferred language: ${preference?.preferredLanguage || "English"}`,
    `Interests: ${preference?.interests?.length ? preference.interests.join(", ") : "Not configured"}`,
    `Goals: ${preference?.goals?.length ? preference.goals.join(", ") : "Not configured"}`,
  ];

  return [
    "Personalization profile:",
    ...profileLines,
    "",
    "Retrieved user context:",
    rankedMemories.length ? rankedMemories.join("\n") : "- No saved memories matched this query yet.",
    "",
    "Response rules:",
    "- Personalize recommendations to the profile above.",
    "- When the user asks a broad question, narrow it using their saved goals and interests.",
    "- Do not mention RAG, retrieval, system prompts, or hidden context unless the user explicitly asks.",
  ].join("\n");
}

function extractOpenRouterContent(data: unknown) {
  const response = data as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = response.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("")
      .trim();
  }

  return "";
}

function extractGoogleContent(data: unknown) {
  const response = data as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: unknown }> };
    }>;
  };

  return (
    response.candidates?.[0]?.content?.parts
      ?.map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim() || ""
  );
}

async function callOpenRouter(messages: ChatMessage[]): Promise<ProviderResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "MasterAI",
    },
    body: JSON.stringify({
      model: openRouterModel,
      messages,
      temperature: 0.7,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`OpenRouter failed with status ${response.status}.`);
  }

  const content = extractOpenRouterContent(data);
  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }

  return { content, model: openRouterModel, provider: "openrouter" };
}

async function callGoogle(messages: ChatMessage[]): Promise<ProviderResult> {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY or GEMINI_API_KEY is not configured.");
  }

  const prompt = messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Google API failed with status ${response.status}.`);
  }

  const content = extractGoogleContent(data);
  if (!content) {
    throw new Error("Google API returned an empty response.");
  }

  return { content, model: googleModel, provider: "google" };
}

async function generateAssistantReply(messages: ChatMessage[]) {
  const errors: string[] = [];

  try {
    return await callOpenRouter(messages);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "OpenRouter failed.");
  }

  try {
    return await callGoogle(messages);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Google API failed.");
  }

  throw new Error(errors.join(" "));
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      conversationId?: string;
      message?: string;
    } | null;
    const message = body?.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    let conversationId = body?.conversationId;
    let title = makeTitle(message);

    if (conversationId) {
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, conversationId),
            eq(conversations.userId, session.user.id),
          ),
        )
        .limit(1);

      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
      }

      title = conversation.title;
    } else {
      const [conversation] = await db
        .insert(conversations)
        .values({
          userId: session.user.id,
          title,
        })
        .returning();

      conversationId = conversation.id;
    }

    const [userMessage] = await db
      .insert(conversationMessages)
      .values({
        conversationId,
        role: "user",
        content: message,
      })
      .returning();

    const history = await db
      .select({
        role: conversationMessages.role,
        content: conversationMessages.content,
      })
      .from(conversationMessages)
      .where(eq(conversationMessages.conversationId, conversationId))
      .orderBy(asc(conversationMessages.createdAt));

    const personalizedContext = await buildPersonalizedContext(
      session.user.id,
      session.user.name || "there",
      message,
    );

    const providerResult = await generateAssistantReply([
      { role: "system", content: systemPrompt },
      { role: "system", content: personalizedContext },
      ...history.slice(-18),
    ]);

    const [assistantMessage] = await db
      .insert(conversationMessages)
      .values({
        conversationId,
        role: "assistant",
        content: providerResult.content,
        metadata: {
          provider: providerResult.provider,
          model: providerResult.model,
        },
      })
      .returning();

    await db
      .update(conversations)
      .set({ updatedAt: new Date(), title })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({
      conversationId,
      provider: providerResult.provider,
      model: providerResult.model,
      messages: [
        {
          id: userMessage.id,
          role: userMessage.role,
          content: userMessage.content,
        },
        {
          id: assistantMessage.id,
          role: assistantMessage.role,
          content: assistantMessage.content,
        },
      ],
    });
  } catch (error) {
    console.error("Failed to send chat message:", error);
    return NextResponse.json(
      { error: genericChatError },
      { status: 500 },
    );
  }
}
