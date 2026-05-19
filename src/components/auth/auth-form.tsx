"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  loginWithPassword,
  signUpWithPassword,
} from "@/server/auth/actions";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const inputClassName =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 font-normal text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15";

const primaryButtonClassName =
  "mt-6 min-h-11 w-full rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55";

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = mode === "login" ? "Log in" : "Create account";
  const submitLabel = mode === "login" ? "Log in" : "Sign up";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must have at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    const result = await (mode === "login"
      ? loginWithPassword({ email, password })
      : signUpWithPassword({ email, password }));

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setNotice("Check your email to confirm your account before logging in.");
      return;
    }

    const next = searchParams.get("next") || "/";
    router.replace(next);
    router.refresh();
  };

  return (
    <form
      className="w-full max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm shadow-[#1f3a45]/5 sm:max-w-md sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
          Workout Evolution
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h1>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Email
        <input
          className={inputClassName}
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>

      <label className="mt-4 flex flex-col gap-2 text-sm font-medium">
        Password
        <input
          className={inputClassName}
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>

      {error ? (
        <p className="mt-4 rounded border border-[#e1b8b8] bg-[#fff7f7] px-3 py-2 text-sm text-[#7b3b3b]">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="mt-4 rounded border border-[#b8d6cb] bg-[#f4fbf8] px-3 py-2 text-sm text-[#245846]">
          {notice}
        </p>
      ) : null}

      <button
        className={primaryButtonClassName}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Please wait..." : submitLabel}
      </button>

      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <a
          className="font-medium text-[var(--accent)]"
          href={mode === "login" ? "/signup" : "/login"}
        >
          {mode === "login" ? "Sign up" : "Log in"}
        </a>
      </p>
    </form>
  );
}
