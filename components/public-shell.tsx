"use client";
import { appHref } from "@/lib/app-links";
import Link from "next/link";
import { Brand } from "./brand";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
export function PublicShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <>
      <div className="ms-utility">
        India’s direct factory-to-buyer network{" "}
        <span>Free requirements · Up to 5 supplier connections</span>
      </div>
      <header className="ms-public-header">
        <Brand />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(
              "/search?q=" +
                encodeURIComponent(
                  new FormData(e.currentTarget).get("q") as string,
                ),
            );
          }}
          className="ms-search"
        >
          <input
            name="q"
            aria-label="Search marketplace"
            placeholder="Search products, manufacturers…"
          />
          <button aria-label="Search">
            <Search size={18} />
          </button>
        </form>
        <Button asChild variant="outline">
          <Link href="/login">Login / Register</Link>
        </Button>
        <Button asChild>
          <Link href={appHref("seller", "/seller/dashboard")}>
            Sell With Us
          </Link>
        </Button>
      </header>
      <nav className="ms-public-nav">
        <Link href="/categories">All Categories</Link>
        <Link href="/suppliers">Verified Suppliers</Link>
        <Link href={appHref("buyer", "/buyer/requirements/create")}>
          Post Your Requirement
        </Link>
        <Link href="/pricing">Supplier Plans</Link>
        <Link href={appHref("buyer", "/buyer/protection")}>
          Buyer Protection
        </Link>
      </nav>
      <main className="ms-public-main">{children}</main>
      <footer className="ms-public-footer">
        <Brand />
        <p>Connecting businesses. Creating possibilities.</p>
        <div>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQs</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
        <small>© 2026 MandiSetu. All rights reserved.</small>
      </footer>
    </>
  );
}
