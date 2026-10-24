"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import type { AppRole, AppUser } from "@/lib/auth/dal";

const navigation: Record<AppRole, Array<[string, string]>> = {
  customer: [["Overview", "/dashboard"], ["Find a home", "/search"], ["Map", "/map"], ["Saved homes", "/saved"], ["Messages", "/inbox"], ["Profile", "/profile"]],
  agent: [["Overview", "/dashboard"], ["My listings", "/agent/listings"], ["Add a listing", "/agent/listings/new"], ["Inbox", "/inbox"], ["Hosting plan", "/agent/billing"], ["Profile", "/profile"]],
  company: [["Overview", "/dashboard"], ["My listings", "/agent/listings"], ["Add a listing", "/agent/listings/new"], ["Inbox", "/inbox"], ["Hosting plan", "/agent/billing"], ["Profile", "/profile"]],
  admin: [["Overview", "/dashboard"], ["Review queue", "/admin/review"], ["Fee table", "/admin/fees"], ["Reports", "/admin/reports"], ["Audit log", "/admin/audit"]],
};

export function AppShell({ user, children }: { user: AppUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const workspaceRoutes = ["/dashboard", "/search", "/saved", "/profile", "/inbox", "/map", "/agent", "/admin"];
  const shouldShowSidebar = workspaceRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="product-shell">
      <aside className="product-sidebar">
        <Link className="product-brand" href="/">Lagur<span>+</span></Link>
        <p className="eyebrow">YOUR WORKSPACE</p>
        <nav aria-label="Workspace">
          {navigation[user.role].map(([label, href]) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
                <span aria-hidden="true">→</span>
              </Link>
            );
          })}
        </nav>
        <form action={signOut} className="sidebar-signout">
          <button type="submit">Sign out <span aria-hidden="true">↗</span></button>
        </form>
      </aside>

      <div className="product-main">
        <header className="product-topbar">
          <div>
            <span className="eyebrow">{user.role.toUpperCase()} ACCOUNT</span>
            <strong>{user.fullName || user.email}</strong>
          </div>
          <Link className="product-avatar" href="/profile" aria-label="Open profile">
            {(user.fullName || user.email).slice(0, 1).toUpperCase()}
          </Link>
        </header>

        <main className="product-content">{children}</main>
      </div>
    </div>
  );
}
