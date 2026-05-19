import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  { href: "/", label: "Dashboard", status: "active" },
  { href: "/progression", label: "Progression", status: "available" },
] as const;

export function DashboardNav() {
  return (
    <nav className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm shadow-[#1f3a45]/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {navItems.map((item) => (
          <Link
            className={`min-h-11 rounded-lg border px-3 py-2.5 text-center text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 sm:text-left ${
              item.status === "active"
                ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm shadow-[#1f3a45]/10"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
            }`}
            href={item.href}
            key={item.label}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <LogoutButton />
    </nav>
  );
}
