import Link from "next/link";
import styles from "./page.module.css";

type Capability = {
  number: string;
  title: string;
  description: string;
  motif: "orbit" | "grid" | "steps" | "signal";
};

type StoryBeat = {
  number: string;
  label: string;
  title: string;
  body: string;
  signal: string;
};

const capabilities: Capability[] = [
  {
    number: "01",
    title: "Hyper-personalized chat",
    description:
      "A conversation that remembers your context, not just your last question.",
    motif: "orbit",
  },
  {
    number: "02",
    title: "Dynamic roadmaps",
    description:
      "Turn a distant ambition into the next clear, achievable move.",
    motif: "steps",
  },
  {
    number: "03",
    title: "Skill gap analysis",
    description:
      "See what is missing between where you are and what you want next.",
    motif: "grid",
  },
  {
    number: "04",
    title: "Resource curation",
    description:
      "Fewer links. Better signals. Materials selected for your trajectory.",
    motif: "signal",
  },
];

const storyBeats: StoryBeat[] = [
  {
    number: "01",
    label: "your craft",
    title: "It understands the work behind the question.",
    body: "MasterAI starts with your profession, vocabulary, and level of fluency. Advice lands differently when it knows what a good day at work actually looks like.",
    signal: "SYSTEM_DESIGN_MODE",
  },
  {
    number: "02",
    label: "your ambition",
    title: "It maps the distance to what is next.",
    body: "Bring a goal that feels too large. MasterAI turns it into a living roadmap with the skills, practice, and projects that make progress visible.",
    signal: "ROADMAP / 30 DAYS",
  },
  {
    number: "03",
    label: "your nuance",
    title: "It speaks in a way that feels like you.",
    body: "Your preferred language and personal context shape every response, so guidance stays clear, culturally aware, and useful in the moments that matter.",
    signal: "LANGUAGE / EN-US",
  },
];

function Brand() {
  return (
    <a className={styles.brand} href="#top" aria-label="MasterAI home">
      <span className={styles.brandMark} aria-hidden="true">
        <span />
      </span>
      <span>
        master<span className={styles.brandAccent}>ai</span>
      </span>
    </a>
  );
}

function StoryVisual() {
  return (
    <div className={styles.dashboardFrame}>
      <div className={styles.dashboardChrome}>
        <div className={styles.windowDots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className={styles.chromePath}>masterai / workspace</span>
        <span className={styles.chromeStatus}>live context</span>
      </div>

      <div className={styles.dashboardBody}>
        <aside className={styles.dashboardSidebar} aria-label="Context summary">
          <div className={styles.sidebarLabel}>context</div>
          <div className={styles.contextAvatar} aria-hidden="true">
            <span>AM</span>
          </div>
          <p className={styles.contextName}>Alex Morgan</p>
          <p className={styles.contextRole}>Product designer</p>

          <div className={styles.contextList}>
            <div>
              <span>goal</span>
              <strong>Lead with clarity</strong>
            </div>
            <div>
              <span>focus</span>
              <strong>Systems thinking</strong>
            </div>
            <div>
              <span>language</span>
              <strong>English / US</strong>
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <span className={styles.liveDot} />
            profile synced
          </div>
        </aside>

        <div className={styles.dashboardMain}>
          <div className={styles.dashboardMainHeader}>
            <div>
              <p className={styles.dashboardEyebrow}>good morning, alex</p>
              <h3>Make the next move count.</h3>
            </div>
            <span className={styles.dateStamp}>MON / 08:42</span>
          </div>

          <div className={styles.dashboardPrompt}>
            <span className={styles.promptMarker}>ask</span>
            <p>How do I become a stronger systems thinker?</p>
            <span className={styles.promptArrow} aria-hidden="true">
              ↗
            </span>
          </div>

          <div className={styles.dashboardResponse}>
            <div className={styles.responseHeader}>
              <span className={styles.responseOrb} aria-hidden="true" />
              <span>masterai / considered response</span>
              <span className={styles.responseTime}>0.8s</span>
            </div>
            <p>
              Start by making the invisible visible. This week, map the
              decisions your team repeats and name the trade-offs behind them.
            </p>
            <div className={styles.responseTags}>
              <span>practice</span>
              <span>systems</span>
              <span>week 01</span>
            </div>
          </div>

          <div className={styles.roadmapPreview}>
            <div className={styles.roadmapHeader}>
              <span>your live roadmap</span>
              <span>03 / 08 moves</span>
            </div>
            <div className={styles.roadmapLine}>
              <span className={styles.roadmapMarker} />
              <div>
                <strong>Map the system</strong>
                <span>in progress / 72%</span>
              </div>
              <span className={styles.roadmapBar}>
                <span />
              </span>
            </div>
            <div className={styles.roadmapLine}>
              <span className={styles.roadmapMarker} />
              <div>
                <strong>Share the pattern</strong>
                <span>next up / tomorrow</span>
              </div>
              <span className={styles.roadmapBarMuted} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className={styles.page} id="top">
      <div className={styles.progress} aria-hidden="true" />

      <section className={styles.hero} aria-labelledby="hero-title">
        <header className={styles.navbar}>
          <Brand />
          <nav className={styles.navLinks} aria-label="Primary navigation">
            <a href="#experience">The engine</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#initialize">Early access</a>
          </nav>
          <Link className={styles.navCta} href="/auth?mode=signup">
            Start a profile <span aria-hidden="true">↗</span>
          </Link>
        </header>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              <span>01</span> personal intelligence system
            </p>
            <h1 id="hero-title">
              Intelligence,
              <br />
              tailored to your <em>trajectory.</em>
            </h1>
            <p className={styles.heroLead}>
              MasterAI learns what makes your work, ambition, and voice yours —
              then turns that context into guidance you can actually use.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/auth?mode=signup">
                Configure your context <span aria-hidden="true">↗</span>
              </Link>
              <a className={styles.secondaryLink} href="#experience">
                See the engine <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className={styles.heroFootnote}>
              <span>built for the long game</span>
              <span>01—04 / context layers</span>
            </div>
          </div>

          <aside className={styles.dossier} aria-label="MasterAI context preview">
            <div className={styles.dossierTopline}>
              <span>context / 001</span>
              <span className={styles.dossierStatus}>
                <i /> learning your signal
              </span>
            </div>
            <div className={styles.dossierTitle}>
              <span className={styles.dossierIndex}>A</span>
              <div>
                <p>personal profile</p>
                <h2>Not another blank chat.</h2>
              </div>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.profileLine}>
                <span>target</span>
                <strong>Senior product designer</strong>
              </div>
              <div className={styles.profileLine}>
                <span>interests</span>
                <strong>AI / systems / writing</strong>
              </div>
              <div className={styles.profileLine}>
                <span>direction</span>
                <strong>Lead with clarity</strong>
              </div>
            </div>

            <div className={styles.dossierResponse}>
              <div className={styles.dossierResponseLabel}>
                <span>masterai / response</span>
                <span>just now</span>
              </div>
              <p>
                Your next edge is not more information. It is a sharper way to
                connect the information you already hold.
              </p>
              <div className={styles.dossierRule} />
              <div className={styles.dossierMeta}>
                <span>tone: direct</span>
                <span>mode: mentor</span>
              </div>
            </div>

            <div className={styles.dossierBottomline}>
              <span>the answer changes when the context does</span>
              <span>↗</span>
            </div>
          </aside>
        </div>
        <div className={styles.heroRail} aria-hidden="true">
          <span>scroll to calibrate</span>
          <span className={styles.heroRailLine} />
          <span>masterai / 2025—26</span>
        </div>
      </section>

      <section className={styles.storySection} id="experience" aria-labelledby="story-title">
        <div className={styles.sectionIntro}>
          <p className={styles.kicker}>
            <span>02</span> the engine
          </p>
          <h2 id="story-title">
            Context becomes <em>clarity.</em>
          </h2>
          <p>
            The more MasterAI understands about your world, the less generic
            the next move becomes.
          </p>
        </div>

        <div className={styles.storyGrid}>
          <div className={styles.stickyColumn}>
            <StoryVisual />
            <p className={styles.stickyCaption}>
              A living workspace that gets more useful with every honest
              answer.
            </p>
          </div>
          <div className={styles.storyBeats}>
            {storyBeats.map((beat) => (
              <article className={styles.storyBeat} key={beat.number}>
                <div className={styles.storyBeatTopline}>
                  <span>{beat.number}</span>
                  <span>{beat.label}</span>
                </div>
                <h3>{beat.title}</h3>
                <p>{beat.body}</p>
                <div className={styles.storySignal}>
                  <span className={styles.signalDot} aria-hidden="true" />
                  {beat.signal}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.capabilitiesSection} id="capabilities" aria-labelledby="capabilities-title">
        <div className={styles.capabilitiesHeader}>
          <div>
            <p className={styles.kicker}>
              <span>03</span> the toolkit
            </p>
            <h2 id="capabilities-title">
              Built for <em>forward motion.</em>
            </h2>
          </div>
          <p>
            Not more features. A tighter loop between the person you are and
            the person you are becoming.
          </p>
        </div>

        <div className={styles.capabilityRail}>
          {capabilities.map((capability) => (
            <article className={styles.capability} key={capability.number}>
              <div className={styles.capabilityNumber}>{capability.number}</div>
              <div className={`${styles.motif} ${styles[`motif${capability.motif}`]}`} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className={styles.capabilityCopy}>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </div>
              <span className={styles.capabilityArrow} aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.statementSection} aria-labelledby="statement-title">
        <div className={styles.statementRule} aria-hidden="true" />
        <p className={styles.statementKicker}>a working principle / 04</p>
        <blockquote id="statement-title">
          Generic advice yields generic results.
          <br />
          <em>Demand mastery.</em>
        </blockquote>
        <p className={styles.statementFootnote}>
          The signal is personal. The progress is yours.
        </p>
      </section>

      <section className={styles.ctaSection} id="initialize" aria-labelledby="cta-title">
        <div className={styles.ctaPanel}>
          <div className={styles.ctaPanelTopline}>
            <span>masterai / early access</span>
            <span>05</span>
          </div>
          <div className={styles.ctaPanelContent}>
            <p className={styles.kickerDark}>the next move is yours</p>
            <h2 id="cta-title">
              Ready to configure <em>your intellect?</em>
            </h2>
            <p>
              Leave your email and be first to shape a more personal kind of
              AI assistant.
            </p>
            <form className={styles.ctaForm} action="/auth" method="get">
              <input type="hidden" name="mode" value="signup" />
              <label className={styles.srOnly} htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@somewhere.com"
                required
              />
              <button type="submit">
                Initialize <span aria-hidden="true">↗</span>
              </button>
            </form>
            <p className={styles.ctaNote}>No noise. Just a sharper next move.</p>
          </div>
        </div>

        <footer className={styles.footer}>
          <Brand />
          <p>Personal intelligence for the long game.</p>
          <div className={styles.footerLinks}>
            <a href="#experience">The engine</a>
            <span aria-hidden="true">/</span>
            <a href="#capabilities">Capabilities</a>
            <span aria-hidden="true">/</span>
            <a href="#top">Back to top ↗</a>
          </div>
        </footer>
      </section>
    </main>
  );
}
