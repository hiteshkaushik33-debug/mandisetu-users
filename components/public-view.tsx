"use client";
import { appHref } from "@/lib/app-links";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, ArrowRight, Search, LockKeyhole } from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { categories, type Role } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, ProductGrid, SupplierGrid } from "@/components/marketplace";
import { PageHeading } from "@/components/page-heading";
import { Empty } from "@/components/empty";
import { RequirementForm } from "@/components/requirement-form";
import { PublicShell } from "@/components/public-shell";
import { BuyerPlans as UsersPlans } from "./plans";
export function PublicView({ path }: { path: string[] }) {
  const { state, notify, setRole } = useMarketplace();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [city, setCity] = useState("");
  const [verified, setVerified] = useState(false);
  const [max, setMax] = useState("");
  const [maxMoq, setMaxMoq] = useState("");
  const name = path[0];
  const { data: products = [] } = useQuery({
    queryKey: [
      "catalogue",
      state.products,
      state.sellers,
      q,
      category,
      city,
      verified,
      max,
      maxMoq,
    ],
    queryFn: async () =>
      state.products.filter((p) => {
        const s = state.sellers.find((s) => s.id === p.sellerId);
        return (
          p.status === "Active" &&
          (!q ||
            (p.name + " " + p.category + " " + s?.company)
              .toLowerCase()
              .includes(q.toLowerCase())) &&
          (!category || p.category === category) &&
          (!city || s?.city.toLowerCase().includes(city.toLowerCase())) &&
          (!verified || s?.kyc === "Approved") &&
          (!max || p.price <= Number(max)) &&
          (!maxMoq || p.moq <= Number(maxMoq))
        );
      }),
  });
  if (name === "login" || name === "register")
    return (
      <div className="ms-auth">
        <div className="ms-auth-intro">
          <span className="eyebrow">BETTER BUSINESS STARTS HERE</span>
          <h1>
            Your next connection.
            <br />
            Your next opportunity.
          </h1>
          <p>
            One marketplace for buyers, manufacturers, and growing businesses.
          </p>
          <div>
            <ShieldCheck />
            Relevant leads. Direct conversations. Trusted connections.
          </div>
        </div>
        <div className="ms-card ms-auth-card">
          <h2>
            {name === "register" ? "Join MandiSetu" : "Welcome to MandiSetu"}
          </h2>
          <p>Choose a workspace to explore the interactive design preview.</p>
          <Badge tone="amber">Preview access · no live authentication</Badge>
          <div className="ms-role-choices">
            {(["buyer", "seller", "admin"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  if (r === "buyer") router.push("/buyer/dashboard");
                  else
                    window.location.assign(appHref(r, "/" + r + "/dashboard"));
                }}
              >
                <span className="ms-avatar">{r[0].toUpperCase()}</span>
                <div>
                  <strong>
                    {r === "buyer"
                      ? "I’m sourcing products"
                      : r === "seller"
                        ? "I’m a manufacturer / supplier"
                        : "Marketplace administration"}
                  </strong>
                  <small>
                    {r === "buyer"
                      ? "Post free requirements and discover suppliers"
                      : r === "seller"
                        ? "Manage products and unlock relevant leads"
                        : "Review businesses, leads, and claims"}
                  </small>
                </div>
                <ArrowRight size={18} />
              </button>
            ))}
          </div>
          <p className="ms-form-note">
            <LockKeyhole size={13} /> Live JWT authentication is handled by the
            NestJS API.
          </p>
        </div>
      </div>
    );
  if (name === "pricing")
    return (
      <>
        <PageHeading
          title="Plans for growing businesses"
          description="Monthly supplier plans. Pricing is configurable by the marketplace administrator."
        />
        <UsersPlans />
      </>
    );
  if (name === "suppliers") {
    if (path[1]) {
      const s = state.sellers.find((s) => s.id === path[1]);
      return s ? (
        <>
          <div className="ms-supplier-profile ms-card">
            <div className="ms-avatar">
              {s.company
                .split(" ")
                .map((s) => s[0])
                .join("")}
            </div>
            <div>
              <h1>{s.company}</h1>
              <p>
                {s.city}, India · {s.years} years in business
              </p>
              <Badge tone={s.kyc === "Approved" ? "green" : "amber"}>
                {s.kyc === "Approved"
                  ? "Verified supplier"
                  : "Verification pending"}
              </Badge>
            </div>
            <Button asChild>
              <Link href={appHref("buyer", "/buyer/requirements/create")}>
                Send a requirement
              </Link>
            </Button>
          </div>
          <PageHeading title="Product catalogue" description={s.category} />
          <ProductGrid
            products={state.products.filter(
              (p) => p.sellerId === s.id && p.status === "Active",
            )}
          />
        </>
      ) : (
        <Empty title="Supplier not found" />
      );
    }
    return (
      <>
        <PageHeading
          title="Find your next supplier"
          description="Explore manufacturers and business partners across India."
        />
        <SupplierGrid />
      </>
    );
  }
  if (name === "categories")
    return (
      <>
        <PageHeading
          title="Explore industry categories"
          description="Source products for every part of your business."
        />
        <div className="ms-category-grid">
          {categories.map((c, i) => (
            <Link
              href={"/products?category=" + encodeURIComponent(c)}
              className="ms-card ms-category-card"
              key={c}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{c}</h3>
              <p>
                Explore suppliers <ArrowRight size={15} />
              </p>
            </Link>
          ))}
        </div>
      </>
    );
  if (name === "search" || name === "products") {
    if (path[1]) {
      const p = state.products.find(
        (p) => p.id === path[1] && p.status === "Active",
      );
      const s = state.sellers.find((s) => s.id === p?.sellerId);
      return p ? (
        <div className="ms-product-detail">
          <img src={p.image} alt={p.name} />
          <div>
            <span className="eyebrow">{p.category}</span>
            <h1>{p.name}</h1>
            <p className="ms-detail-price">
              {money(p.price)} <small>/ {p.unit}</small>
            </p>
            <p>
              Minimum order: {p.moq} {p.unit}s
            </p>
            <p>{p.description}</p>
            <Link href={"/suppliers/" + p.sellerId}>
              {s?.company} · {s?.city}
            </Link>
            <div className="ms-detail-actions">
              <Button asChild>
                <Link
                  href={
                    "/buyer/requirements/create?product=" +
                    encodeURIComponent(p.name)
                  }
                >
                  Request a quote
                </Link>
              </Button>
            </div>
            <p className="ms-form-note">
              Indicative pricing. Agree final specifications, price, and
              delivery directly with the supplier.
            </p>
          </div>
        </div>
      ) : (
        <Empty title="Product not found" />
      );
    }
    return (
      <>
        <PageHeading
          title="Discover products & manufacturers"
          description="Source directly. Connect with relevant business suppliers."
        />
        <div className="ms-catalogue-layout">
          <aside className="ms-card ms-filters">
            <h3>Refine your search</h3>
            <label className="ms-field">
              Product or supplier
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
              />
            </label>
            <label className="ms-field">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="ms-field">
              City
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Any city"
              />
            </label>
            <label className="ms-field">
              Maximum price (₹)
              <input
                type="number"
                min="0"
                value={max}
                onChange={(e) => setMax(e.target.value)}
              />
            </label>
            <label className="ms-field">
              Maximum MOQ
              <input
                type="number"
                min="1"
                value={maxMoq}
                onChange={(e) => setMaxMoq(e.target.value)}
              />
            </label>
            <label className="ms-checkbox">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
              />
              Verified suppliers only
            </label>
            <Button
              variant="ghost"
              onClick={() => {
                setQ("");
                setCategory("");
                setCity("");
                setMax("");
                setMaxMoq("");
                setVerified(false);
              }}
            >
              Clear filters
            </Button>
          </aside>
          <div>
            <p className="ms-results-count">
              {products.length} matching products
            </p>
            <ProductGrid products={products} />
          </div>
        </div>
      </>
    );
  }
  if (name === "post-requirement")
    return (
      <>
        <PageHeading title="Post a free requirement" />
        <div className="ms-card">
          <RequirementForm />
        </div>
      </>
    );
  if (name === "about" || name === "faq" || name === "how-it-works")
    return (
      <div className="ms-reading ms-card">
        <span className="eyebrow">MANDISETU</span>
        <h1>
          {name === "about"
            ? "Business, connected."
            : name === "faq"
              ? "Frequently asked questions"
              : "From requirement to connection"}
        </h1>
        <p>{state.cms[name === "about" ? "about" : "faq"]}</p>
        <h2>How the marketplace works</h2>
        <ol>
          <li>Buyers post a purchase requirement for free.</li>
          <li>
            Relevant suppliers see the requirement with buyer contact locked.
          </li>
          <li>
            Up to five suppliers unlock the lead with a credit or verified
            payment.
          </li>
          <li>Buyers and suppliers negotiate the deal directly.</li>
        </ol>
        <Button asChild>
          <Link href={appHref("buyer", "/buyer/requirements/create")}>
            Post your requirement
          </Link>
        </Button>
      </div>
    );
  if (name === "contact")
    return (
      <div className="ms-reading ms-card">
        <h1>Let’s talk business</h1>
        <p>
          Contact information and support channels can be configured before
          launch.
        </p>
        <p>
          For this preview, explore the{" "}
          <Link href={appHref("buyer", "/buyer/dashboard")}>buyer</Link>,{" "}
          <Link href={appHref("seller", "/seller/dashboard")}>supplier</Link>,
          and <Link href={appHref("admin", "/admin/dashboard")}>admin</Link>{" "}
          workspaces.
        </p>
      </div>
    );
  if (
    ["terms", "privacy", "refund-policy", "buyer-protection-policy"].includes(
      name,
    )
  )
    return (
      <div className="ms-reading ms-card">
        <h1>
          {name
            .split("-")
            .map((s) => s[0].toUpperCase() + s.slice(1))
            .join(" ")}
        </h1>
        <Badge tone="amber">Policy content pending</Badge>
        <p>
          Client-approved legal terms and financial rules must be supplied
          before launch. This page is reserved for the final policy content.
        </p>
      </div>
    );
  return (
    <Empty
      title="Page not found"
      description="Return to the marketplace to continue browsing."
    />
  );
}
export function PublicRoute({ slug }: { slug: string[] }) {
  return (
    <PublicShell>
      <PublicView path={slug} />
    </PublicShell>
  );
}
