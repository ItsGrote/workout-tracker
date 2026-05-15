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
    <div className="relative">
      <label className="flex flex-col gap-2 text-sm font-medium">
        {label}
        <input
          className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)] disabled:bg-[#f4f6f8]"
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
        <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                className="w-full rounded px-3 py-2 text-left text-sm hover:bg-[var(--accent-soft)]"
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
            <p className="px-3 py-2 text-sm text-[var(--muted)]">
              {emptyMessage}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
