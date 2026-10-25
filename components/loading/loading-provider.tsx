"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LagurLoader } from "./lagur-loader";

const MIN_VISIBLE_MS = 1000;   // the logo animation always gets to play
const MAX_VISIBLE_MS = 12000;  // safety: never leave the overlay stuck

type Ctx = {
  show: (label?: string) => void;
  hide: () => void;
  go: (href: string, label?: string) => void;
};

const LoadingContext = createContext<Ctx | null>(null);

export function useLagurLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLagurLoading must be used inside <LoadingProvider>");
  return ctx;
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState<string | undefined>(undefined);
  const shownAt = useRef(0);
  const pathAtShow = useRef<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pathname = usePathname();
  const router = useRouter();

  const show = useCallback((text?: string) => {
    clearTimeout(hideTimer.current);
    shownAt.current = Date.now();
    pathAtShow.current = window.location.pathname;
    setLabel(text);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(hideTimer.current);
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current));
    hideTimer.current = setTimeout(() => setOpen(false), wait);
  }, []);

  const go = useCallback((href: string, text?: string) => {
    show(text);
    router.push(href);
  }, [router, show]);

  // The new page has rendered: hide the overlay.
  useEffect(() => {
    if (open && pathAtShow.current !== null && pathname !== pathAtShow.current) hide();
  }, [pathname, open, hide]);

  // Safety net.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), MAX_VISIBLE_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const value = useMemo(() => ({ show, hide, go }), [show, hide, go]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LagurLoader open={open} label={label} />
    </LoadingContext.Provider>
  );
}
