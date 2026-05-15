type AchievementBannerProps = {
  message: string;
  tone?: "success" | "neutral";
};

export function AchievementBanner({
  message,
  tone = "success",
}: AchievementBannerProps) {
  const colorClass =
    tone === "success"
      ? "border-[#b8d6cb] bg-[#f4fbf8] text-[#245846]"
      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]";

  return (
    <div className={`animate-rise rounded border px-4 py-3 text-sm ${colorClass}`}>
      {message}
    </div>
  );
}

