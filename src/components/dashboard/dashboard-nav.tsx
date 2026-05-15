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
    <nav className="flex flex-col gap-3 rounded border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <Link
            className={`rounded px-3 py-2 text-sm font-medium ${
              item.status === "active"
                ? "bg-[var(--foreground)] text-white"
                : "border border-[var(--border)] text-[var(--muted)]"
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
