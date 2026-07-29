"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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

  useEffect(() => {
    if (!session.isPending && !user) {
      router.replace("/auth?mode=signin");
    }
  }, [router, session.isPending, user]);

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
                          <p className={styles.userText}>{msg.content}</p>
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
          <div className={styles.mockScreenContainer}>
            <h2 className={styles.mockHeading}>Profile Settings</h2>
            <p className={styles.mockHeadingSub}>intellect layers configuration</p>
            <p className={styles.mockDescText}>
              These parameters determine the tone, complexity, vocabulary, and direction of the generated roadmaps.
            </p>

            <div className={styles.profileEditGrid}>
              <div className={styles.profileEditRow}>
                <span className={styles.profileFieldLabel}>Name</span>
                <span className={styles.profileFieldValue}>{displayName}</span>
              </div>
              <div className={styles.profileEditRow}>
                <span className={styles.profileFieldLabel}>Current Role</span>
                <span className={styles.profileFieldValue}>Product Designer</span>
              </div>
              <div className={styles.profileEditRow}>
                <span className={styles.profileFieldLabel}>Target Goal</span>
                <span className={styles.profileFieldValue}>Become a Senior Product Designer & Lead Systems Thinker</span>
              </div>
              <div className={styles.profileEditRow}>
                <span className={styles.profileFieldLabel}>Interests</span>
                <span className={styles.profileFieldValue}>AI, Design Systems, Technical Writing</span>
              </div>
              <div className={styles.profileEditRow}>
                <span className={styles.profileFieldLabel}>Calibrated Tone</span>
                <span className={styles.profileFieldValue}>Direct, Mentoring, Academic</span>
              </div>
              <div className={styles.profileEditRow}>
                <span className={styles.profileFieldLabel}>Preferred Language</span>
                <span className={styles.profileFieldValue}>English / US</span>
              </div>
            </div>

            <div className={styles.mockActions}>
              <button
                onClick={() => alert("Mock Action: Editing profile parameters.")}
                className={styles.buttonPrimary}
                style={{ width: "auto", display: "inline-flex" }}
              >
                Configure Profile
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={styles.buttonSecondary}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
