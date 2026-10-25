"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useLagurLoading } from "./loading-provider";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string; loadingLabel?: string };

/**
 * Use for key actions (Get Started, Sign in, Sign up, Find me recommendations).
 * Internal navigation shows the Lagur loading screen. Modified clicks, external links
 * and links to the page you are already on behave like a normal link.
 */
export function LoaderLink({ href, loadingLabel, onClick, children, ...rest }: Props) {
  const { go } = useLagurLoading();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (rest.target && rest.target !== "_self") return;
    if (!href.startsWith("/")) return;
    if (href.split("?")[0].split("#")[0] === window.location.pathname) return;
    e.preventDefault();
    go(href, loadingLabel);
  }

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
