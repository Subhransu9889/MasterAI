"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "./dashboard.module.css";

type Recommendation = {
  id: string;
  tag: "roadmap" | "project" | "reading" | "practice";
  title: string;
  status: string;
  complexity: string;
};

type RecentConversation = {
  id: string;
  index: string;
  title: string;
  date: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type PersonalizationProfile = {
  profession: string;
  interests: string[];
  goals: string[];
  preferredLanguage: string;
  learningLevel: string;
  tone: string;
  answerStyle: string;
  background: string;
  constraints: string;
};

type ProfileForm = Omit<PersonalizationProfile, "interests" | "goals"> & {
  interests: string;
  goals: string;
};

const defaultProfile: PersonalizationProfile = {
  profession: "Product Designer",
  interests: ["AI", "Design Systems", "Technical Writing"],
  goals: ["Become a Senior Product Designer", "Lead systems thinking"],
  preferredLanguage: "English",
  learningLevel: "Normal context",
  tone: "Direct, mentoring, academic",
  answerStyle: "Give clear steps, examples, tradeoffs, and next actions.",
  background: "I am building MasterAI as a personalized intelligence and learning assistant.",
  constraints: "Keep answers practical, specific, and adapted to my current goals.",
};

const roleOptions = [
  "Product Designer",
  "Frontend Developer",
  "Full Stack Developer",
  "Backend Developer",
  "AI Engineer",
  "Data Analyst",
  "Product Manager",
  "Student",
  "Founder",
  "Marketing Specialist",
];

const learningLevelOptions = [
  "Low context",
  "Normal context",
  "Mid context",
  "Advanced context",
  "More context advanced",
];

const toneOptions = [
  "Direct, mentoring, academic",
  "Friendly and practical",
  "Concise and action-focused",
  "Detailed and explanatory",
  "Senior coach style",
];

const answerStyleOptions = [
  "Give clear steps, examples, tradeoffs, and next actions.",
  "Short answer first, then details.",
  "Step-by-step with examples.",
  "Deep explanation with context.",
  "Checklist and action plan.",
];

function normalizeLearningLevel(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "beginner") return "Low context";
  if (normalized === "intermediate") return "Normal context";
  if (normalized === "advanced") return "Advanced context";

  return learningLevelOptions.includes(value) ? value : "Normal context";
}

function normalizePreferredLanguage(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized.startsWith("hindi")) return "Hindi";
  return "English";
}

function withSavedOption(options: string[], value: string) {
  return value && !options.includes(value) ? [value, ...options] : options;
}

const defaultRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    tag: "roadmap",
    title: "Learn React Hooks",
    status: "In progress / 72% done",
    complexity: "medium",
  },
  {
    id: "rec-2",
    tag: "project",
    title: "Build a Weather App",
    status: "Recommended / 2 days duration",
    complexity: "simple",
  },
  {
    id: "rec-3",
    tag: "reading",
    title: "Read Clean Code",
    status: "Recommended / Theoretical study",
    complexity: "theoretical",
  },
  {
    id: "rec-4",
    tag: "practice",
    title: "Practice Arrays",
    status: "Next up / Tomorrow priority",
    complexity: "simple",
  },
];

const defaultConversations: RecentConversation[] = [
  {
    id: "chat-1",
    index: "01",
    title: "Create a 30-day AI learning roadmap",
    date: "today",
  },
  {
    id: "chat-2",
    index: "02",
    title: "Suggest projects based on my interests",
    date: "yesterday",
  },
  {
    id: "chat-3",
    index: "03",
    title: "Explain React Server Components vs Client Components",
    date: "3 days ago",
  },
  {
    id: "chat-4",
    index: "04",
    title: "Design system structure and naming conventions",
    date: "last week",
  },
  {
    id: "chat-5",
    index: "05",
    title: "Prepare for frontend developer technical interview",
    date: "2 weeks ago",
  },
];

const loadingSteps = [
  "Thinking...",
  "Reading the conversation context...",
  "Planning a useful answer...",
  "Writing the response...",
];

function profileToForm(profile: PersonalizationProfile): ProfileForm {
  return {
    ...profile,
    preferredLanguage: normalizePreferredLanguage(profile.preferredLanguage),
    learningLevel: normalizeLearningLevel(profile.learningLevel),
    interests: profile.interests.join(", "),
    goals: profile.goals.join(", "),
  };
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderInlineText(text: string) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${part}-${index}`} className={styles.assistantInlineCode}>
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function renderFormattedMessage(content: string) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let index = 0;

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();

    if (text) {
      blocks.push(
        <p key={`paragraph-${blocks.length}`} className={styles.assistantParagraph}>
          {renderInlineText(text)}
        </p>,
      );
    }

    paragraph = [];
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      blocks.push(
        <pre key={`code-${blocks.length}`} className={styles.assistantCodeBlock}>
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      index += 1;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      blocks.push(
        <h3 key={`heading-${blocks.length}`} className={styles.assistantHeading}>
          {renderInlineText(heading[2])}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) {
      flushParagraph();
      const ordered = /^\d+[.)]\s+/.test(trimmed);
      const items: string[] = [];

      while (index < lines.length) {
        const item = lines[index].trim();
        const matchesListType = ordered
          ? /^\d+[.)]\s+/.test(item)
          : /^[-*]\s+/.test(item);

        if (!matchesListType) break;

        items.push(item.replace(ordered ? /^\d+[.)]\s+/ : /^[-*]\s+/, ""));
        index += 1;
      }

      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag key={`list-${blocks.length}`} className={styles.assistantList}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInlineText(item)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      blocks.push(
        <blockquote key={`quote-${blocks.length}`} className={styles.assistantQuote}>
          {renderInlineText(trimmed.replace(/^>\s?/, ""))}
        </blockquote>,
      );
      index += 1;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      blocks.push(<hr key={`rule-${blocks.length}`} className={styles.assistantDivider} />);
      index += 1;
      continue;
    }

    paragraph.push(trimmed);
    index += 1;
  }

  flushParagraph();

  return <div className={styles.assistantText}>{blocks}</div>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recs] = useState<Recommendation[]>(defaultRecommendations);
  const [chats] = useState<RecentConversation[]>(defaultConversations);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Pure frontend Chat session states
  const [isChatActive, setIsChatActive] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string>("openrouter/free");
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [profileForm, setProfileForm] = useState<ProfileForm>(() => profileToForm(defaultProfile));
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, chatError]);

  useEffect(() => {
    if (!isSending) {
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStepIndex((current) => (current + 1) % loadingSteps.length);
    }, 1600);

    return () => window.clearInterval(timer);
  }, [isSending]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    setIsChatActive(true);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);
    setLoadingStepIndex(0);
    setChatError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          message: userMessage.content,
        }),
      });

      const data = (await response.json()) as {
        conversationId?: string;
        provider?: string;
        model?: string;
        messages?: ChatMessage[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "MasterAI could not complete that request.");
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      if (data.provider && data.model) {
        setActiveProvider(`${data.provider} / ${data.model}`);
      }

      const assistantMessage = data.messages?.find((message) => message.role === "assistant");
      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "MasterAI could not complete that request.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const session = authClient.useSession();
  const user = session.data?.user;
  const displayName = user?.name || "there";
  const firstName = displayName.split(" ")[0] || displayName;
  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "MA",
    [displayName],
  );
  const visibleRoleOptions = withSavedOption(roleOptions, profileForm.profession);
  const visibleToneOptions = withSavedOption(toneOptions, profileForm.tone);
  const visibleAnswerStyleOptions = withSavedOption(
    answerStyleOptions,
    profileForm.answerStyle,
  );

  useEffect(() => {
    if (!session.isPending && !user) {
      router.replace("/auth?mode=signin");
    }
  }, [router, session.isPending, user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadProfile() {
      setIsProfileLoading(true);
      setProfileError(null);

      try {
        const response = await fetch("/api/profile");
        const data = (await response.json()) as PersonalizationProfile & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Could not load profile settings.");
        }

        if (!cancelled) {
          setProfileForm(profileToForm(data));
        }
      } catch (error) {
        if (!cancelled) {
          setProfileError(
            error instanceof Error
              ? error.message
              : "Could not load profile settings.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClose = () => setDropdownOpen(false);
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const handleRecAction = (title: string) => {
    alert(`Mock Action: Starting activity for "${title}"`);
  };

  const updateProfileField = (field: keyof ProfileForm, value: string) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
    setProfileStatus(null);
    setProfileError(null);
  };

  const handleProfileSave = async () => {
    setIsProfileSaving(true);
    setProfileStatus(null);
    setProfileError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profileForm,
          interests: splitList(profileForm.interests),
          goals: splitList(profileForm.goals),
        }),
      });
      const data = (await response.json()) as PersonalizationProfile & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Could not save profile settings.");
      }

      setProfileForm(profileToForm(data));
      setProfileStatus("Saved. New chats will use this personalization context.");
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Could not save profile settings.",
      );
    } finally {
      setIsProfileSaving(false);
    }
  };

  // Helper to render SVG icons for the horizontal recommendation cards
  const renderCardIcon = (tag: "roadmap" | "project" | "reading" | "practice") => {
    switch (tag) {
      case "roadmap":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
        );
      case "project":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
            <line x1="14" y1="4" x2="10" y2="20" />
          </svg>
        );
      case "reading":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        );
      case "practice":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        );
    }
  };

  // Helper to determine CSS class based on card tag
  const getIconClass = (tag: "roadmap" | "project" | "reading" | "practice") => {
    switch (tag) {
      case "roadmap":
        return styles.recIconRoadmap;
      case "project":
        return styles.recIconProject;
      case "reading":
        return styles.recIconReading;
      case "practice":
        return styles.recIconPractice;
    }
  };

  return (
    <main className={styles.dashboardContainer}>
      {/* Sidebar Overlay backdrop on mobile */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarActive : ""}`}>
        <div className={styles.sidebarBranding}>
          <Link href="/" className={styles.brand} aria-label="MasterAI home">
            <span className={styles.brandMark} aria-hidden="true">
              <span />
            </span>
            <span>
              master<span className={styles.brandAccent}>ai</span>
            </span>
          </Link>
          <span className={styles.brandSubline}>personal intelligence</span>
        </div>

        <nav className={styles.navLinks} aria-label="Sidebar navigation">
          <Link href="/" className={styles.navLink} onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            back to home
          </Link>
          <button
            type="button"
            className={`${styles.navLink} ${activeTab === "dashboard" ? styles.navLinkActive : ""}`}
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            dashboard
          </button>
          <button
            type="button"
            className={`${styles.navLink} ${activeTab === "chat" ? styles.navLinkActive : ""}`}
            onClick={() => {
              setActiveTab("chat");
              setSidebarOpen(false);
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            chat
          </button>
          <button
            type="button"
            className={`${styles.navLink} ${activeTab === "profile" ? styles.navLinkActive : ""}`}
            onClick={() => {
              setActiveTab("profile");
              setSidebarOpen(false);
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            profile settings
          </button>
        </nav>
      </aside>

      {/* Main scrolling area (Right) */}
      <section className={styles.mainContent}>
        {/* Mobile Header Bar */}
        <header className={styles.mobileHeader}>
          <button
            type="button"
            className={styles.hamburgerButton}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className={styles.brand} aria-label="MasterAI home">
            <span className={styles.brandMark} aria-hidden="true">
              <span />
            </span>
            <span>
              master<span className={styles.brandAccent}>ai</span>
            </span>
          </Link>
          <div className={styles.userDropdownContainer}>
            <div
              className={styles.avatarMobile}
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
              title="User Profile Menu"
            >
              {initials}
            </div>

            {dropdownOpen && (
              <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                <div className={styles.dropdownEmailRow}>
                  <span
                    className={styles.dropdownEmail}
                    title={user?.email || "user@masterai.com"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("profile");
                      setDropdownOpen(false);
                    }}
                  >
                    {user?.email || "user@masterai.com"}
                  </span>
                  <button
                    type="button"
                    className={styles.profileArrowButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("profile");
                      setDropdownOpen(false);
                    }}
                    title="Go to Profile Settings"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
                <div className={styles.dropdownDivider} />
                <button
                  type="button"
                  className={styles.logoutButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    handleSignOut();
                  }}
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </header>
        
        {/* Top Header Row with Welcome & Quick Actions */}
        <header className={styles.welcomeHeader}>
          <div className={styles.welcomeText}>
            <p className={styles.welcomeEyebrow}>
              <span className={styles.pulseDot} />
              trajectory status / active calibrating
            </p>
            <h1 className={styles.welcomeTitle}>Welcome back, {firstName}</h1>
          </div>

          <div className={styles.topActionsArea}>
            <div className={styles.quickButtons}>
              <button
                onClick={() => setActiveTab("chat")}
                className={styles.buttonOutline}
              >
                + new chat
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={styles.buttonPrimary}
              >
                + configure context
              </button>
            </div>
            
            <div className={styles.userDropdownContainer}>
              <div
                className={styles.userDropdown}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                title="User Profile Menu"
              >
                <div className={styles.avatar}>{initials}</div>
                <span className={styles.userName}>{firstName.toLowerCase()}</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.dropdownChevron}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {dropdownOpen && (
                <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.dropdownEmailRow}>
                    <span
                      className={styles.dropdownEmail}
                      title={user?.email || "user@masterai.com"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab("profile");
                        setDropdownOpen(false);
                      }}
                    >
                      {user?.email || "user@masterai.com"}
                    </span>
                    <button
                      type="button"
                      className={styles.profileArrowButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab("profile");
                        setDropdownOpen(false);
                      }}
                      title="Go to Profile Settings"
                    >
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <button
                    type="button"
                    className={styles.logoutButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(false);
                      handleSignOut();
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic section content based on active tab */}
        {activeTab === "dashboard" && (
          <>
            {/* Curated roadmaps/recommendations card grid */}
            <div>
              <header className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Curated Roadmaps</h2>
                  <p className={styles.sectionTitleSub}>Personalized daily & default system trajectories</p>
                </div>
                <span className={styles.sectionMeta}>4 target moves</span>
              </header>

              <div className={styles.recsGrid}>
                {recs.map((rec) => (
                  <article
                    key={rec.id}
                    className={styles.recCard}
                    onClick={() => handleRecAction(rec.title)}
                  >
                    <div className={`${styles.recIconBox} ${getIconClass(rec.tag)}`}>
                      {renderCardIcon(rec.tag)}
                    </div>
                    <div className={styles.recDetails}>
                      <h3 className={styles.recTitle}>{rec.title}</h3>
                      <span className={styles.recStatus}>{rec.status}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Recent conversation tables */}
            <div>
              <header className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Recent Conversations</h2>
                  <p className={styles.sectionTitleSub}>Last 5 chat history entries</p>
                </div>
                <span className={styles.sectionMeta}>historical calibration</span>
              </header>

              <div className={styles.convList}>
                {chats.map((chat) => (
                  <a
                    key={chat.id}
                    href="#chat"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("chat");
                    }}
                    className={styles.convItem}
                  >
                    <span className={styles.convIndex}>{chat.index}</span>
                    <strong className={styles.convItemTitle}>{chat.title}</strong>
                    <div className={styles.convItemMeta}>
                      <span className={styles.convDate}>{chat.date}</span>
                      <span className={styles.convArrow} aria-hidden="true">
                        →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "chat" && (
          !isChatActive ? (
            <div className={styles.mockScreenContainer}>
              <h2 className={styles.mockHeading}>The assistant is ready to converse.</h2>
              <p className={styles.mockHeadingSub}>layer 02 / hyper-personalized assistant</p>
              <p className={styles.mockDescText}>
                Your target profile context (Senior Product Designer, Design Systems, Systems Thinking) is already active. Ask a specific roadmapping or skill questions to start generating calibrated guidelines.
              </p>
              <div className={styles.mockActions}>
                <button
                  onClick={() => setIsChatActive(true)}
                  className={styles.buttonPrimary}
                  style={{ width: "auto", display: "inline-flex" }}
                >
                  Start New Session
                </button>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={styles.buttonSecondary}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.chatWorkspaceFullscreen}>
              {/* Minimalist Top Bar for Chat tab */}
              <div className={styles.chatTopBar}>
                <div className={styles.chatInfo}>
                  <span className={styles.chatInfoBadge}>assistant / active</span>
                  <span className={styles.chatTitleLabel}>new session</span>
                </div>
                <button 
                  onClick={() => {
                    setIsChatActive(false);
                    setConversationId(null);
                    setMessages([]);
                    setChatError(null);
                  }} 
                  className={styles.chatNewButton}
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Exit Session
                </button>
              </div>

              {/* Chat message feed */}
              <div className={styles.chatMessagesArea}>
                {messages.length === 0 ? (
                  <div className={styles.chatEmptyState}>
                    <div className={styles.chatEmptyStateHeader}>
                      <p className={styles.chatEmptyKicker}>masterai / logic engine</p>
                      <h2 className={styles.chatEmptyTitle}>Where shall we take your <em>trajectory</em> today?</h2>
                      <p className={styles.chatEmptyDesc}>
                        Select a starter path below or type a custom query. Your profile context is automatically active.
                      </p>
                    </div>
                    
                    <div className={styles.promptStartersGrid}>
                      <button
                        onClick={() => handleSendMessage("Create a 30-day AI learning roadmap.")}
                        className={styles.promptCard}
                      >
                        <div className={styles.promptCardHeader}>
                          <span className={styles.promptCardLabel}>roadmap</span>
                          <span className={styles.promptCardArrow}>↗</span>
                        </div>
                        <h4 className={styles.promptCardTitle}>Create a 30-day AI learning roadmap</h4>
                        <p className={styles.promptCardSub}>Get a prioritized list of tasks, projects, and key resources.</p>
                      </button>

                      <button
                        onClick={() => handleSendMessage("Suggest projects based on my interests.")}
                        className={styles.promptCard}
                      >
                        <div className={styles.promptCardHeader}>
                          <span className={styles.promptCardLabel}>project</span>
                          <span className={styles.promptCardArrow}>↗</span>
                        </div>
                        <h4 className={styles.promptCardTitle}>Suggest projects based on my interests</h4>
                        <p className={styles.promptCardSub}>Get customized hands-on project ideas with suggested tech stacks.</p>
                      </button>

                      <button
                        onClick={() => handleSendMessage("Design system structure and naming conventions.")}
                        className={styles.promptCard}
                      >
                        <div className={styles.promptCardHeader}>
                          <span className={styles.promptCardLabel}>architecture</span>
                          <span className={styles.promptCardArrow}>↗</span>
                        </div>
                        <h4 className={styles.promptCardTitle}>Design system structure and naming conventions</h4>
                        <p className={styles.promptCardSub}>Understand primitive vs semantic tokens and layout design principles.</p>
                      </button>

                      <button
                        onClick={() => handleSendMessage("Prepare for frontend developer technical interview.")}
                        className={styles.promptCard}
                      >
                        <div className={styles.promptCardHeader}>
                          <span className={styles.promptCardLabel}>career</span>
                          <span className={styles.promptCardArrow}>↗</span>
                        </div>
                        <h4 className={styles.promptCardTitle}>Prepare for frontend developer technical interview</h4>
                        <p className={styles.promptCardSub}>Get ready with core JavaScript, TypeScript, React, and system design topics.</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.messageList}>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`${styles.messageRow} ${
                          msg.role === "user" ? styles.messageRowUser : styles.messageRowAssistant
                        }`}
                      >
                        <div className={styles.messageAvatar}>
                          {msg.role === "user" ? initials : "AI"}
                        </div>
                        <div className={styles.messageBubble}>
                          {msg.role === "user" ? (
                            <p className={styles.userText}>{msg.content}</p>
                          ) : (
                            renderFormattedMessage(msg.content)
                          )}
                        </div>
                      </div>
                    ))}
                    {isSending && (
                      <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                        <div className={styles.messageAvatar}>AI</div>
                        <div className={`${styles.messageBubble} ${styles.thinkingBubble}`}>
                          <span className={styles.thinkingLabel}>
                            {loadingSteps[loadingStepIndex]}
                          </span>
                          <span className={styles.thinkingDots} aria-hidden="true">
                            <span />
                            <span />
                            <span />
                          </span>
                        </div>
                      </div>
                    )}
                    {chatError && !isSending && (
                      <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                        <div className={styles.messageAvatar}>AI</div>
                        <div className={`${styles.messageBubble} ${styles.errorBubble}`}>
                          <p className={styles.userText}>{chatError}</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Dock */}
              <div className={styles.chatInputDock}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }}
                  className={styles.chatInputWrapper}
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isSending}
                    placeholder="Ask MasterAI a question..."
                    className={styles.chatInput}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isSending}
                    className={styles.chatSendButton}
                    aria-label="Send message"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </form>
                <p className={styles.chatFootnote}>
                  MasterAI calibrated to {firstName.toLowerCase()}&apos;s trajectory. Provider: {activeProvider}.
                </p>
              </div>
            </div>
          )
        )}

        {activeTab === "profile" && (
          <div className={styles.profilePanel}>
            <header className={styles.profilePanelHeader}>
              <div>
                <p className={styles.mockHeadingSub}>personalization memory</p>
                <h2 className={styles.mockHeading}>Profile Settings</h2>
              </div>
              <span className={styles.profileSyncBadge}>
                {isProfileLoading ? "loading" : "rag context active"}
              </span>
            </header>

            <div className={styles.profileContextStrip}>
              <div>
                <span className={styles.profileFieldLabel}>Signed in as</span>
                <strong>{displayName}</strong>
              </div>
              <div>
                <span className={styles.profileFieldLabel}>AI behavior</span>
                <strong>Personalized from profile + retrieved memories</strong>
              </div>
            </div>

            <div className={styles.profileFormGrid}>
              <label className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Current role</span>
                <select
                  value={profileForm.profession}
                  onChange={(event) => updateProfileField("profession", event.target.value)}
                  className={styles.profileSelect}
                >
                  {visibleRoleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Learning level</span>
                <select
                  value={profileForm.learningLevel}
                  onChange={(event) => updateProfileField("learningLevel", event.target.value)}
                  className={styles.profileSelect}
                >
                  {learningLevelOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Interests</span>
                <input
                  value={profileForm.interests}
                  onChange={(event) => updateProfileField("interests", event.target.value)}
                  className={styles.profileInput}
                  placeholder="AI, React, Design Systems"
                />
              </label>

              <label className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Preferred language</span>
                <select
                  value={profileForm.preferredLanguage}
                  onChange={(event) => updateProfileField("preferredLanguage", event.target.value)}
                  className={styles.profileSelect}
                >
                  <option value="English">English</option>
                  <option value="Hindi" disabled>
                    Hindi - coming soon
                  </option>
                </select>
              </label>

              <label className={`${styles.profileField} ${styles.profileFieldWide}`}>
                <span className={styles.profileFieldLabel}>Goals</span>
                <textarea
                  value={profileForm.goals}
                  onChange={(event) => updateProfileField("goals", event.target.value)}
                  className={styles.profileTextarea}
                  rows={3}
                  placeholder="Become a senior frontend engineer, build AI products..."
                />
              </label>

              <label className={`${styles.profileField} ${styles.profileFieldWide}`}>
                <span className={styles.profileFieldLabel}>Calibrated tone</span>
                <select
                  value={profileForm.tone}
                  onChange={(event) => updateProfileField("tone", event.target.value)}
                  className={styles.profileSelect}
                >
                  {visibleToneOptions.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`${styles.profileField} ${styles.profileFieldWide}`}>
                <span className={styles.profileFieldLabel}>Answer style</span>
                <select
                  value={profileForm.answerStyle}
                  onChange={(event) => updateProfileField("answerStyle", event.target.value)}
                  className={styles.profileSelect}
                >
                  {visibleAnswerStyleOptions.map((answerStyle) => (
                    <option key={answerStyle} value={answerStyle}>
                      {answerStyle}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`${styles.profileField} ${styles.profileFieldWide}`}>
                <span className={styles.profileFieldLabel}>Constraints</span>
                <textarea
                  value={profileForm.constraints}
                  onChange={(event) => updateProfileField("constraints", event.target.value)}
                  className={styles.profileTextarea}
                  rows={3}
                  placeholder="Avoid vague advice, keep it fast, focus on practical output..."
                />
              </label>
            </div>

            {(profileStatus || profileError) && (
              <p className={profileError ? styles.profileError : styles.profileStatus}>
                {profileError || profileStatus}
              </p>
            )}

            <div className={styles.mockActions}>
              <button
                onClick={handleProfileSave}
                disabled={isProfileSaving || isProfileLoading}
                className={styles.buttonPrimary}
                style={{ width: "auto", display: "inline-flex" }}
              >
                {isProfileSaving ? "Saving..." : "Save Personalization"}
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={styles.buttonSecondary}
              >
                Test in Chat
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
