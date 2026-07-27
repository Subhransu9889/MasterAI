"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recs] = useState<Recommendation[]>(defaultRecommendations);
  const [chats] = useState<RecentConversation[]>(defaultConversations);

  const handleSignOut = () => {
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
          <div className={styles.avatarMobile} onClick={handleSignOut} title="Click to Sign Out">
            AM
          </div>
        </header>
        
        {/* Top Header Row with Welcome & Quick Actions */}
        <header className={styles.welcomeHeader}>
          <div className={styles.welcomeText}>
            <p className={styles.welcomeEyebrow}>
              <span className={styles.pulseDot} />
              trajectory status / active calibrating
            </p>
            <h1 className={styles.welcomeTitle}>Welcome Back, Alex 👋</h1>
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
            
            <div className={styles.userDropdown} onClick={handleSignOut} title="Click to Sign Out">
              <div className={styles.avatar}>AM</div>
              <span className={styles.userName}>alex</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.dropdownChevron}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
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
          <div className={styles.mockScreenContainer}>
            <h2 className={styles.mockHeading}>"The assistant is ready to converse."</h2>
            <p className={styles.mockHeadingSub}>layer 02 / hyper-personalized assistant</p>
            <p className={styles.mockDescText}>
              Your target profile context (Senior Product Designer, Design Systems, Systems Thinking) is already active. Ask a specific roadmapping or skill questions to start generating calibrated guidelines.
            </p>
            <div className={styles.mockActions}>
              <button
                onClick={() => alert("Mock Action: Starting a new chat session.")}
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
                <span className={styles.profileFieldValue}>Alex Morgan</span>
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
