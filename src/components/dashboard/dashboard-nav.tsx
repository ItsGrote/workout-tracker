import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  { label: "Dashboard", status: "active" },
  { label: "Workouts", status: "soon" },
  { label: "Evolution", status: "soon" },
  { label: "Goals", status: "soon" },
] as const;

export function DashboardNav() {
  return (
    <nav className="flex flex-col gap-3 rounded border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <button
            className={`rounded px-3 py-2 text-sm font-medium ${
              item.status === "active"
                ? "bg-[var(--foreground)] text-white"
                : "border border-[var(--border)] text-[var(--muted)]"
            }`}
            disabled={item.status === "soon"}
            key={item.label}
            type="button"
          >
            {item.label}
            {item.status === "soon" ? " · soon" : ""}
          </button>
        ))}
      </div>
      <LogoutButton />
    </nav>
  );
}

