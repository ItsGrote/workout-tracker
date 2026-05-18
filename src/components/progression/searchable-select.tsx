"use client";

import { useMemo, useState } from "react";

type SearchableSelectProps = {
  disabled?: boolean;
  emptyMessage: string;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
};

const inputClassName =
  "min-h-11 w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 font-normal text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 disabled:cursor-not-allowed disabled:bg-[var(--accent-soft)] disabled:opacity-70";

const optionButtonClassName =
  "min-h-10 w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] transition hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20";

export function SearchableSelect({
  disabled,
  emptyMessage,
  label,
  onChange,
  options,
  placeholder,
  value,
}: SearchableSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      option.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  return (
    <div className="relative min-w-0">
      <label className="flex flex-col gap-2 text-sm font-medium">
        <span className="flex items-center justify-between gap-3">
          <span>{label}</span>
          {value ? (
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
              Selected
            </span>
          ) : null}
        </span>
        <input
          className={inputClassName}
          disabled={disabled}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          value={isOpen ? query : value}
        />
      </label>

      {isOpen && !disabled ? (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[var(--accent)] bg-[var(--surface)] p-1.5 shadow-xl shadow-[#1f3a45]/10">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            {query ? "Filtered results" : "Available options"}
          </p>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                className={optionButtonClassName}
                key={option}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(option);
                  setQuery("");
                  setIsOpen(false);
                }}
                type="button"
              >
                {option}
              </button>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--accent-soft)] px-3 py-3 text-sm text-[var(--muted)]">
              {emptyMessage}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
