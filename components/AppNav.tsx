"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChartStore } from "@/components/ChartProvider";
import { WeekStepper } from "@/components/WeekStepper";

const TABS = [
  { href: "/", label: "Chart" },
  { href: "/today", label: "Today" },
  { href: "/review", label: "Review" },
  { href: "/stats", label: "Stats" },
] as const;

const WEEK_SCOPED_ROUTES = new Set<string>(["/", "/review"]);

export function AppNav() {
  const pathname = usePathname();
  const { status, chart } = useChartStore();

  if (status !== "ready" || !chart || pathname === "/onboarding") return null;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-accent">Haruda Method</p>
          <p className="truncate font-display text-[15px] leading-snug text-ink">
            {chart.goal}
          </p>
        </div>

        {WEEK_SCOPED_ROUTES.has(pathname) && <WeekStepper compact />}

        <nav aria-label="Views">
          <ul className="flex items-center gap-1">
            {TABS.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-full px-3 py-1.5 text-[13px] transition ${
                      isActive
                        ? "bg-ink text-page"
                        : "text-ink-soft hover:bg-surface hover:text-ink"
                    }`}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
