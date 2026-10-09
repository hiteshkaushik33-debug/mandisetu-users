"use client";
import { appHref } from "@/lib/app-links";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  ShieldCheck,
  CreditCard,
  Settings,
  Bell,
  BarChart3,
  Bookmark,
  LogOut,
  ChevronRight,
  Search,
  Menu,
  X,
  Globe,
  Wallet,
  MessageSquare,
  Tags,
  LifeBuoy,
} from "lucide-react";
import { useState } from "react";
import { Brand } from "./brand";
import { useMarketplace } from "@/lib/store";
import type { Role } from "@/lib/data";
import { buyerNavigation } from "@/components/navigation";
const navigation: ReadonlyArray<
  readonly [string, string, typeof LayoutDashboard]
> = buyerNavigation;
export function PanelShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, setRole } = useMarketplace();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const selected = [...navigation]
    .sort((a, b) => b[0].length - a[0].length)
    .find(([p]) => pathname.startsWith("/" + role + "/" + p));
  return (
    <div className="ms-panel">
      <aside className={"ms-sidebar " + (open ? "open" : "")}>
        <Brand />
        <button
          className="ms-close-sidebar"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          <X />
        </button>
        <div className="ms-workspace-label">
          {role === "admin"
            ? "MARKETPLACE ADMIN"
            : role === "seller"
              ? "SUPPLIER WORKSPACE"
              : "BUYER WORKSPACE"}
        </div>
        <nav>
          {navigation.map(([path, label, Icon]) => (
            <Link
              key={path}
              href={"/" + role + "/" + path}
              className={selected?.[0] === path ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {label}
              {role === "admin" && path === "kyc" && (
                <span className="ms-nav-count">
                  {state.sellers.filter((s) => s.kyc === "Under Review").length}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="ms-sidebar-bottom">
          <div className="ms-support">
            <LifeBuoy size={20} />
            <strong>Here to help your business</strong>
            <Link href="/contact">
              Contact support <ChevronRight size={13} />
            </Link>
          </div>
          <Link href="/">
            <Globe size={16} /> Back to marketplace
          </Link>
          <button
            onClick={() => {
              setRole(null);
              router.push("/login");
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="ms-sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="ms-panel-body">
        <header className="ms-panel-header">
          <button
            className="ms-menu-button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <div className="ms-breadcrumb">
            {role === "admin"
              ? "Admin"
              : role === "seller"
                ? "Supplier"
                : "Buyer"}{" "}
            workspace <ChevronRight size={14} />
            <strong>{selected?.[1] || "Overview"}</strong>
          </div>
          <div className="ms-header-actions">
            <Link href="/search" aria-label="Search marketplace">
              <Search size={19} />
            </Link>
            <button
              className="ms-notification-button"
              onClick={() => setNotifications(!notifications)}
              aria-label="View notifications"
            >
              <Bell size={19} />
              <i />
            </button>
            <div className="ms-header-divider" />
            <div className="ms-avatar small">
              {role === "admin" ? "AD" : role === "seller" ? "NT" : "RM"}
            </div>
            <div className="ms-user-name">
              <strong>
                {role === "admin"
                  ? "Super Admin"
                  : role === "seller"
                    ? state.sellers[0].name
                    : state.profile.name}
              </strong>
              <small>
                {role === "admin"
                  ? "Marketplace administrator"
                  : role === "seller"
                    ? state.sellers[0].company
                    : state.profile.company}
              </small>
            </div>
          </div>
          {notifications && (
            <div className="ms-notification-popover">
              <h3>Notifications</h3>
              {state.activity.slice(0, 5).map((a, i) => (
                <p key={i}>{a}</p>
              ))}
            </div>
          )}
        </header>
        <div className="ms-preview-notice">
          Interactive design preview · Sample data saved in this browser{" "}
          <div>
            <Link href={appHref("buyer", "/buyer/dashboard")}>Buyer</Link>
            <Link href={appHref("seller", "/seller/dashboard")}>Seller</Link>
            <Link href={appHref("admin", "/admin/dashboard")}>Admin</Link>
          </div>
        </div>
        <main className="ms-panel-content">{children}</main>
        <footer className="ms-panel-footer">
          © 2026 MandiSetu <span>Built for serious trade.</span>
        </footer>
      </div>
    </div>
  );
}
