type SummaryCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function SummaryCard({ label, value, detail }: SummaryCardProps) {
  return (
    <section className="rounded border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{detail}</p>
    </section>
  );
}

