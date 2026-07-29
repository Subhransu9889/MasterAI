import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { memories, preferences } from "@/db/schema";
import { auth } from "@/lib/auth";

type ProfilePayload = {
  profession?: string;
  interests?: string[];
  goals?: string[];
  preferredLanguage?: string;
  learningLevel?: string;
  tone?: string;
  answerStyle?: string;
  background?: string;
  constraints?: string;
};

const profileMemoryKeys = ["tone", "answerStyle", "background", "constraints"];

const defaultProfile = {
  profession: "Product Designer",
  interests: ["AI", "Design Systems", "Technical Writing"],
  goals: ["Become a Senior Product Designer", "Lead systems thinking"],
  preferredLanguage: "English",
  learningLevel: "Normal context",
  tone: "Direct, mentoring, academic",
  answerStyle: "Give clear steps, examples, tradeoffs, and next actions.",
  background: "The user is building MasterAI as a personalized intelligence and learning assistant.",
  constraints: "Keep answers practical, specific, and adapted to the user's current goals.",
};

function cleanList(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 12);
}

function cleanText(value: unknown, fallback: string, maxLength = 1200) {
  if (typeof value !== "string") return fallback;

  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user || null;
}

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [preference] = await db
      .select()
      .from(preferences)
      .where(eq(preferences.userId, user.id))
      .limit(1);

    const profileMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.userId, user.id));

    const memoryByKey = new Map(
      profileMemories.map((memory) => [memory.key, memory.value]),
    );

    return NextResponse.json({
      profession: preference?.profession || defaultProfile.profession,
      interests: preference?.interests?.length
        ? preference.interests
        : defaultProfile.interests,
      goals: preference?.goals?.length ? preference.goals : defaultProfile.goals,
      preferredLanguage:
        preference?.preferredLanguage || defaultProfile.preferredLanguage,
      learningLevel: preference?.learningLevel || defaultProfile.learningLevel,
      tone: memoryByKey.get("tone") || defaultProfile.tone,
      answerStyle: memoryByKey.get("answerStyle") || defaultProfile.answerStyle,
      background: memoryByKey.get("background") || defaultProfile.background,
      constraints: memoryByKey.get("constraints") || defaultProfile.constraints,
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { error: "Could not load profile settings." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as ProfilePayload | null;

    const profile = {
      profession: cleanText(body?.profession, defaultProfile.profession, 140),
      interests: cleanList(body?.interests),
      goals: cleanList(body?.goals),
      preferredLanguage: cleanText(
        body?.preferredLanguage,
        defaultProfile.preferredLanguage,
        80,
      ),
      learningLevel: cleanText(
        body?.learningLevel,
        defaultProfile.learningLevel,
        80,
      ),
      tone: cleanText(body?.tone, defaultProfile.tone, 240),
      answerStyle: cleanText(body?.answerStyle, defaultProfile.answerStyle, 500),
      background: cleanText(body?.background, defaultProfile.background, 1200),
      constraints: cleanText(body?.constraints, defaultProfile.constraints, 800),
    };

    await db
      .insert(preferences)
      .values({
        userId: user.id,
        profession: profile.profession,
        interests: profile.interests.length ? profile.interests : defaultProfile.interests,
        goals: profile.goals.length ? profile.goals : defaultProfile.goals,
        preferredLanguage: profile.preferredLanguage,
        learningLevel: profile.learningLevel,
      })
      .onConflictDoUpdate({
        target: preferences.userId,
        set: {
          profession: profile.profession,
          interests: profile.interests.length ? profile.interests : defaultProfile.interests,
          goals: profile.goals.length ? profile.goals : defaultProfile.goals,
          preferredLanguage: profile.preferredLanguage,
          learningLevel: profile.learningLevel,
          updatedAt: new Date(),
        },
      });

    await db
      .delete(memories)
      .where(
        and(
          eq(memories.userId, user.id),
          eq(memories.source, "profile"),
          inArray(memories.key, profileMemoryKeys),
        ),
      );

    await db.insert(memories).values(
      profileMemoryKeys.map((key) => ({
        userId: user.id,
        source: "profile" as const,
        key,
        value: profile[key as keyof Pick<
          typeof profile,
          "tone" | "answerStyle" | "background" | "constraints"
        >],
        confidence: 100,
        metadata: { editable: true },
      })),
    );

    return NextResponse.json({
      ...profile,
      interests: profile.interests.length ? profile.interests : defaultProfile.interests,
      goals: profile.goals.length ? profile.goals : defaultProfile.goals,
    });
  } catch (error) {
    console.error("Failed to save profile:", error);
    return NextResponse.json(
      { error: "Could not save profile settings." },
      { status: 500 },
    );
  }
}
