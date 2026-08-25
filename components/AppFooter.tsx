const LINKS = [
  {
    href: "https://github.com/ethancha0",
    label: "GitHub",
    icon: (
      <path d="M12 2C6.48 2 2 6.58 2 12.17c0 4.48 2.87 8.27 6.84 9.61.5.1.68-.22.68-.5 0-.24-.01-1.03-.01-1.87-2.78.62-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .28.18.61.69.5A10.02 10.02 0 0 0 22 12.17C22 6.58 17.52 2 12 2Z" />
    ),
  },
  {
    href: "https://www.ethanwchao.com/",
    label: "Portfolio",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M3 12h18M12 3c2.4 2.5 3.6 5.6 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.6-3.6-9s1.2-6.5 3.6-9Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </>
    ),
  },
  {
    href: "https://www.linkedin.com/in/ethanchaoo/",
    label: "LinkedIn",
    icon: (
      <path d="M6.94 8.5H3.56V20.5h3.38V8.5ZM5.25 3.5a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.5 20.5h-3.38v-6.3c0-1.5-.03-3.43-2.09-3.43-2.1 0-2.42 1.64-2.42 3.32v6.41H9.23V8.5h3.24v1.64h.05c.45-.85 1.55-1.75 3.19-1.75 3.41 0 4.04 2.25 4.04 5.17V20.5Z" />
    ),
  },
] as const;

export function AppFooter() {
  return (
    <footer className="border-t border-line bg-page mt-15 mb-15">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-5">
        <a href="https://www.ethanwchao.com/"><p className="eyebrow text-ink-faint underline">by Ethan Chao</p></a>
        <nav aria-label="External links">
          <ul className="flex items-center gap-2.5">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-[0_1px_2px_rgba(46,42,37,0.06)] transition duration-150 hover:-translate-y-0.5 hover:border-accent-soft hover:text-accent hover:shadow-[0_6px_14px_rgba(46,42,37,0.12)]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    {link.icon}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
