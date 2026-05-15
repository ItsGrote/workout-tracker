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
      className="rounded bg-[var(--foreground)] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      disabled={isSigningOut}
      onClick={handleLogout}
      type="button"
    >
      {isSigningOut ? "Logging out..." : "Logout"}
    </button>
  );
}
