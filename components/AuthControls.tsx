"use client";

import { useChartStore } from "@/components/ChartProvider";

export function AuthControls() {
  const { user, signOut } = useChartStore();
  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      {user.email && (
        <span className="hidden max-w-40 truncate text-[12px] text-ink-faint sm:block">
          {user.email}
        </span>
      )}
      <button
        type="button"
        onClick={() => void signOut()}
        className="text-[12px] text-ink-faint underline decoration-transparent underline-offset-4 transition hover:text-ink hover:decoration-ink/40"
      >
        Sign out
      </button>
    </div>
  );
}
