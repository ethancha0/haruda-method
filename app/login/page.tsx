"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(
    searchParams.get("error") === "auth"
      ? "Google sign-in did not finish. Try again."
      : "",
  );

  const signIn = async () => {
    setPending(true);
    setError("");
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setPending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-20">
      <Link href="/">
        <p className="eyebrow text-accent">Haruda Method</p>
      </Link>
      <h1 className="mt-3 font-display text-4xl leading-tight">
        Sign in to keep the chart with you.
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
        Google is the door. Your goal, themes, actions, and logs live in your
        account so a new browser does not start you over.
      </p>

      <button
        type="button"
        onClick={() => void signIn()}
        disabled={pending}
        className="mt-9 rounded-full bg-ink px-5 py-2.5 text-[14px] text-page transition hover:bg-ink/85 disabled:opacity-35"
      >
        {pending ? "Redirecting…" : "Continue with Google"}
      </button>

      {error && <p className="mt-4 text-[13px] text-accent">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-5 py-20 text-ink-faint">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
