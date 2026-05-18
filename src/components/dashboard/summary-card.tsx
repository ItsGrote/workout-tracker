type SummaryCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function SummaryCard({ label, value, detail }: SummaryCardProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm shadow-[#1f3a45]/5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{detail}</p>
    </section>
  );
}
