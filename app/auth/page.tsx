"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import styles from "./auth.module.css";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const emailParam = searchParams.get("email") || "";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect to dashboard on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const getAuthErrorMessage = (error: unknown) => {
    if (error && typeof error === "object" && "message" in error) {
      const message = error.message;
      if (typeof message === "string") {
        return message;
      }
    }

    return "Authentication failed. Please check your details and try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const result =
        mode === "signup"
          ? await authClient.signUp.email({
              name: name.trim(),
              email,
              password,
              callbackURL: "/dashboard",
            })
          : await authClient.signIn.email({
              email,
              password,
              callbackURL: "/dashboard",
            });

      if (result.error) {
        setErrorMessage(getAuthErrorMessage(result.error));
        return;
      }

      setIsSuccess(true);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/auth?mode=signin",
      });

      if (result.error) {
        setErrorMessage(getAuthErrorMessage(result.error));
        return;
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.authCard}>
        <div className={styles.brandHeader}>
          <div className={styles.logoArea}>
            <span className={styles.brandMark} aria-hidden="true">
              <span />
            </span>
            <span>
              master<span className={styles.brandAccent}>ai</span>
            </span>
          </div>
          <p className={styles.cardSubtitle}>
            {mode === "signup" ? "Account created successfully." : "Welcome back."}
          </p>
        </div>
        <div style={{ textAlign: "center", margin: "2rem 0" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--graphite)" }}>
            Authentication successful. Redirecting to dashboard...
          </p>
          <div className={styles.spinner} />
        </div>
        <Link href="/dashboard" className={styles.submitButton} style={{ textDecoration: "none" }}>
          Continue to Dashboard ↗
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.authCard}>
      <div className={styles.brandHeader}>
        <Link href="/" className={styles.logoArea}>
          <span className={styles.brandMark} aria-hidden="true">
            <span />
          </span>
          <span>
            master<span className={styles.brandAccent}>ai</span>
          </span>
        </Link>
        <p className={styles.cardSubtitle}>
          {mode === "signup"
            ? "Configure your personal intellect layer."
            : "Sign in to resume your trajectory."}
        </p>
      </div>

      <nav className={styles.tabs} aria-label="Auth tabs">
        <button
          type="button"
          className={`${styles.tabButton} ${mode === "signin" ? styles.activeTab : ""}`}
          onClick={() => {
            setMode("signin");
            setErrorMessage("");
          }}
        >
          sign in
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${mode === "signup" ? styles.activeTab : ""}`}
          onClick={() => {
            setMode("signup");
            setErrorMessage("");
          }}
        >
          create account
        </button>
      </nav>

      <form onSubmit={handleSubmit} noValidate>
        {errorMessage && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--lime-dark)",
              backgroundColor: "rgba(130, 152, 0, 0.08)",
              border: "1px solid var(--lime-dark)",
              padding: "0.75rem",
              marginBottom: "1rem",
              borderRadius: "var(--radius-sharp)",
              fontFamily: "var(--font-geist-mono), monospace",
            }}
          >
            {errorMessage}
          </div>
        )}

        {mode === "signup" && (
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
              disabled={isLoading}
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@somewhere.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
            disabled={isLoading}
          />
        </div>

        {mode === "signup" && (
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
              disabled={isLoading}
            />
          </div>
        )}

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? (
            <>
              Authenticating
              <span className={styles.spinnerSmall} />
            </>
          ) : mode === "signup" ? (
            <>
              Initialize Profile ↗
            </>
          ) : (
            <>
              Access Account ↗
            </>
          )}
        </button>
      </form>

      <div className={styles.divider}>or continue with</div>

      <div className={styles.oauthButtons}>
        <button
          type="button"
          className={styles.oauthButton}
          disabled={isLoading}
          onClick={handleGoogleSignIn}
        >
          <span className={styles.oauthIcon}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
          </span>
          Google
        </button>
      </div>

      <div className={styles.footerNote}>
        By continuing, you agree to our{" "}
        <a href="#terms" onClick={(e) => e.preventDefault()}>
          Terms
        </a>{" "}
        and{" "}
        <a href="#privacy" onClick={(e) => e.preventDefault()}>
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className={styles.authContainer}>
      <Link href="/" className={styles.backToHome}>
        ← back to platform
      </Link>
      <Suspense
        fallback={
          <div className={styles.authCard}>
            <div className={styles.brandHeader}>
              <div className={styles.logoArea}>
                <span className={styles.brandMark} aria-hidden="true">
                  <span />
                </span>
                <span>
                  master<span className={styles.brandAccent}>ai</span>
                </span>
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className={styles.spinner} style={{ margin: "0 auto" }} />
            </div>
          </div>
        }
      >
        <AuthForm />
      </Suspense>
    </main>
  );
}
