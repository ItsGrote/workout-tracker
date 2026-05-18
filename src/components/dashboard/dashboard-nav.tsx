import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  { href: "/", label: "Dashboard", status: "active" },
  { href: "/progression", label: "Progression", status: "available" },
  { href: "#", label: "Workouts", status: "soon" },
  { href: "#", label: "Goals", status: "soon" },
] as const;

export function DashboardNav() {
  return (
    <nav className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm shadow-[#1f3a45]/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <Link
            className={`rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 ${
              item.status === "active"
                ? "bg-[var(--accent)] text-white shadow-sm shadow-[#1f3a45]/10"
                : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
            }`}
            href={item.href}
            key={item.label}
          >
            {item.label}
            {item.status === "soon" ? " · soon" : ""}
          </Link>
        ))}
      </div>
      <LogoutButton />
    </nav>
  );
}
