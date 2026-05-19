"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/server/auth/actions";

export function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    await logout();
    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      className="min-h-11 rounded-lg bg-[var(--foreground)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1f3a45]/10 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isSigningOut}
      onClick={handleLogout}
      type="button"
    >
      {isSigningOut ? "Logging out..." : "Logout"}
    </button>
  );
}
