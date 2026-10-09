"use client";
import { appHref } from "@/lib/app-links";
import parse, {
  Element,
  domToReact,
  type HTMLReactParserOptions,
} from "html-react-parser";
import template from "@/components/template.json";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { RequirementForm } from "@/components/requirement-form";
import { ProductGrid, SupplierGrid } from "@/components/marketplace";
export function Home() {
  const router = useRouter();
  const [promo, setPromo] = useState(true);
  const [menu, setMenu] = useState(false);
  const options: HTMLReactParserOptions = {
    replace(node) {
      if (!(node instanceof Element)) return;
      const a = node.attribs;
      const cls = a.class || "";
      if (a.id === "promoBanner" && !promo) return <></>;
      if (a.id === "promoClose")
        return (
          <button
            className="promo-close"
            aria-label="Dismiss offer"
            onClick={() => setPromo(false)}
          >
            ×
          </button>
        );
      if (a.id === "mobileMenu")
        return menu ? (
          <div className="ms-mobile-menu">
            <button onClick={() => setMenu(false)} aria-label="Close menu">
              ×
            </button>
            <Link href="/search">Browse products</Link>
            <Link href="/suppliers">Find suppliers</Link>
            <Link href={appHref("buyer", "/buyer/requirements/create")}>
              Post requirement
            </Link>
            <Link href="/login">Login</Link>
            <Link href={appHref("seller", "/seller/dashboard")}>
              Seller panel
            </Link>
          </div>
        ) : (
          <></>
        );
      if (a["data-bs-target"])
        return (
          <button
            className="btn d-lg-none ms-auto"
            aria-label="Open menu"
            onClick={() => setMenu(true)}
          >
            ☰
          </button>
        );
      if (a["data-dir"])
        return (
          <button
            type="button"
            aria-label={a["aria-label"]}
            onClick={(e) => {
              const nav = e.currentTarget.closest("[data-slider-nav]");
              const key = nav?.getAttribute("data-slider-nav");
              if (key)
                document.querySelector(`[data-slider="${key}"]`)?.scrollBy({
                  left: Number(a["data-dir"]) * 330,
                  behavior: "smooth",
                });
            }}
          >
            {a["data-dir"] === "-1" ? "←" : "→"}
          </button>
        );
      if (cls.includes("search-shell"))
        return (
          <form
            className={cls}
            onSubmit={(e) => {
              e.preventDefault();
              router.push(
                "/search?q=" +
                  encodeURIComponent(
                    new FormData(e.currentTarget).get("q") as string,
                  ),
              );
            }}
          >
            <input
              name="q"
              aria-label="Search products and suppliers"
              placeholder="Search products, suppliers, RFQs…"
            />
            <button aria-label="Search">⌕</button>
          </form>
        );
      if (cls === "rfq-card")
        return (
          <div className="rfq-card">
            <h3>Post a free requirement</h3>
            <p>
              Tell us what you need. Up to 5 relevant suppliers can connect with
              you.
            </p>
            <RequirementForm compact />
          </div>
        );
      if (a.id === "products")
        return (
          <section className="section-pad" id="products">
            <div className="container-xl">
              <div className="ms-section-head">
                <div>
                  <span className="eyebrow">
                    Source directly from manufacturers
                  </span>
                  <h2>Trending wholesale products / factory deals</h2>
                </div>
                <Link href="/products">View all products →</Link>
              </div>
              <ProductGrid />
            </div>
          </section>
        );
      if (a.id === "suppliers")
        return (
          <div className="feat-panel" id="suppliers">
            <h6>Manufacturers &amp; Suppliers</h6>
            <SupplierGrid compact />
          </div>
        );
      if (cls.includes("cat-tile")) {
        const title = node.children.find(
          (n) => n instanceof Element && n.name === "h6",
        );
        const label =
          title && title instanceof Element
            ? title.children.map((n) => ("data" in n ? n.data : "")).join("")
            : "";
        return (
          <Link
            className={cls}
            href={"/products?category=" + encodeURIComponent(label)}
          >
            {domToReact(
              node.children as Parameters<typeof domToReact>[0],
              options,
            )}
          </Link>
        );
      }
      if (cls === "num")
        return (
          <div className="num">
            {a["data-static"] ||
              `${a["data-prefix"] || ""}${Number(a["data-count"]).toLocaleString("en-IN")}${a["data-suffix"] || ""}`}
          </div>
        );
      if (node.name === "a" && a.href === "#") {
        const text = node.children
          .map((n) => ("data" in n ? n.data : ""))
          .join("")
          .trim();
        let href = "/search";
        if (/Login/i.test(text)) href = "/login";
        else if (/Supplier|Sell With|Join as/i.test(text))
          href = "/seller/dashboard";
        else if (/Requirement|Quote/i.test(text))
          href = "/buyer/requirements/create";
        else if (/Track My/i.test(text)) href = "/buyer/requirements";
        else if (/Verification/i.test(text)) href = "/seller/kyc";
        else if (/Dashboard/i.test(text)) href = "/seller/dashboard";
        else if (/Terms/i.test(text)) href = "/terms";
        else if (/Privacy/i.test(text)) href = "/privacy";
        else if (/Protection/i.test(text)) href = "/buyer/protection";
        else if (/Claim Offer/i.test(text)) href = "/pricing";
        else if (/Categories/i.test(text)) href = "/categories";
        return (
          <Link
            href={href.startsWith("/seller/") ? appHref("seller", href) : href}
            className={cls}
            style={undefined}
          >
            {domToReact(
              node.children as Parameters<typeof domToReact>[0],
              options,
            )}
          </Link>
        );
      }
      if (cls.includes("newsletter-input"))
        return (
          <input
            type="email"
            className={cls}
            aria-label="Newsletter email"
            placeholder="Email address"
          />
        );
      if (node.name === "button" && !a["data-dir"]) {
        const t = node.children
          .map((n) => ("data" in n ? n.data : ""))
          .join("");
        if (t === "Join")
          return (
            <Link className="btn-mandi-solid" href="/register">
              Join
            </Link>
          );
      }
    },
  };
  return (
    <div className="ms-template">
      {parse(template, options)}
      <div className="ms-preview-bar">
        <span>Design preview · sample data</span>
        <Link href={appHref("buyer", "/buyer/dashboard")}>Buyer panel</Link>
        <Link href={appHref("seller", "/seller/dashboard")}>Seller panel</Link>
        <Link href={appHref("admin", "/admin/dashboard")}>Admin panel</Link>
      </div>
    </div>
  );
}
