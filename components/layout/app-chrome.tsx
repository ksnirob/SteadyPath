"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { HeartPulse, LogOut, MoreHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const mobileItems = navItems.slice(0, 4);
  const moreItems = navItems.slice(4);
  const moreActive = moreItems.some((item) => item.href === pathname);

  function handleSignOut() {
    void signOut({ callbackUrl: "/login" });
  }

  useEffect(() => {
    if (!moreOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [moreOpen]);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card px-3 py-4 lg:flex">
        <Link href="/dashboard" className="mb-6 flex items-center gap-3 px-3 text-lg font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" aria-hidden />
          </span>
          Steady Path
        </Link>
        <nav className="flex-1 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Log out
        </button>
      </aside>
      <main className="pb-[calc(6rem+env(safe-area-inset-bottom))] lg:ml-64 lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
      {moreOpen ? (
        <div className="fixed inset-0 z-40 bg-background/75 backdrop-blur-sm lg:hidden" onClick={() => setMoreOpen(false)}>
          <div
            id="mobile-more-menu"
            className="absolute inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] max-h-[min(24rem,calc(100dvh-8rem))] overflow-y-auto rounded-lg border bg-card p-3 shadow-lg"
            role="dialog"
            aria-label="More navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-semibold">More</p>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"
                onClick={() => setMoreOpen(false)}
                aria-label="Close more menu"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-md border px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                      active && "bg-muted text-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-3 flex min-h-12 w-full items-center gap-3 rounded-md border px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              <span>Log out</span>
            </button>
          </div>
        </div>
      ) : null}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card/95 px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden" aria-label="Mobile navigation">
        {mobileItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium text-muted-foreground",
                active && "bg-muted text-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen((value) => !value)}
          className={cn(
            "flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium text-muted-foreground",
            moreActive && "bg-muted text-foreground"
          )}
          aria-expanded={moreOpen}
          aria-controls="mobile-more-menu"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
