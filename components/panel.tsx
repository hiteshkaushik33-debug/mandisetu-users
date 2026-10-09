"use client";
import { appHref } from "@/lib/app-links";
import Link from "next/link";
import { ShieldCheck, Plus, ArrowRight } from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { type Role } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, ProductGrid } from "@/components/marketplace";
import { PageHeading } from "@/components/page-heading";
import { Empty } from "@/components/empty";
import { ProfileForm } from "@/components/profile-form";
import { RequirementForm } from "@/components/requirement-form";
import { BuyerDashboard } from "./dashboard";
import { BuyerClaims } from "./claims";
export function BuyerPanel({ path }: { path: string[] }) {
  const role = "buyer" as Role;
  const { state, update, notify } = useMarketplace();
  const section = path[0] || "dashboard";
  const seller = state.sellers[0];
  if (section === "dashboard") return <BuyerDashboard />;
  if (section === "profile")
    return (
      <>
        <PageHeading
          title="Business profile"
          description="Keep your business details up to date."
        />
        <ProfileForm seller={false} />
      </>
    );
  if (section === "requirements") {
    if (path[1] === "create")
      return (
        <>
          <PageHeading
            title="Post a buying requirement"
            description="Free for buyers. Get connected with up to 5 relevant suppliers."
          />
          <div className="ms-card">
            <RequirementForm />
          </div>
        </>
      );
    const leads = state.leads.filter((l) => l.email === state.profile.email);
    const lead = leads.find((l) => l.id === path[1]);
    if (path[1])
      return lead ? (
        <>
          <PageHeading title={lead.title} description={lead.id} />
          <div className="ms-card">
            <Badge tone="green">{lead.status}</Badge>
            <p>{lead.description}</p>
            <div className="ms-detail-grid">
              <div>
                <small>Quantity</small>
                <strong>
                  {lead.quantity} {lead.unit}
                </strong>
              </div>
              <div>
                <small>Budget</small>
                <strong>{money(lead.budget)}</strong>
              </div>
              <div>
                <small>Delivery location</small>
                <strong>{lead.city}</strong>
              </div>
              <div>
                <small>Required by</small>
                <strong>{lead.date}</strong>
              </div>
            </div>
            <p>
              {lead.purchases.length} of 5 supplier slots filled. Supplier
              connections appear after lead unlock.
            </p>
            <Link href={appHref("buyer", "/buyer/requirements")}>
              ← All requirements
            </Link>
          </div>
        </>
      ) : (
        <Empty title="Requirement not found" />
      );
    return (
      <>
        <PageHeading
          title="My requirements"
          description="Manage your sourcing requests and supplier connections."
          action={
            <Button asChild>
              <Link href={appHref("buyer", "/buyer/requirements/create")}>
                <Plus size={16} /> Post requirement
              </Link>
            </Button>
          }
        />
        <div className="ms-card">
          <table className="ms-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Quantity</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Slots</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={"/buyer/requirements/" + l.id}>
                      <strong>{l.title}</strong>
                      <small>
                        {l.id} · {l.city}
                      </small>
                    </Link>
                  </td>
                  <td>
                    {l.quantity} {l.unit}
                  </td>
                  <td>{money(l.budget)}</td>
                  <td>
                    <Badge tone="green">{l.status}</Badge>
                  </td>
                  <td>{l.purchases.length}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!leads.length && <Empty title="No requirements yet" />}
        </div>
      </>
    );
  }
  if (section === "saved")
    return (
      <>
        <PageHeading
          title="Saved products"
          description="Your shortlist for the next business deal."
        />
        <ProductGrid
          products={state.products.filter((p) => state.saved.includes(p.id))}
        />
      </>
    );
  if (section === "claims") return <BuyerClaims />;
  if (section === "protection")
    return (
      <>
        <PageHeading
          title="Buyer Protection"
          description="Track protection for eligible negotiated transactions. Every claim is manually reviewed."
        />
        <div className="ms-card">
          <ShieldCheck size={40} className="ms-green-icon" />
          <h2>Confidence for your next business deal</h2>
          <p>
            Record your deal, agreed delivery date, invoice, and payment
            evidence. If a covered deal fails, submit a claim for admin review.
            Your supplier has the right to respond.
          </p>
          <div className="ms-detail-grid">
            <div>
              <small>Sample deal</small>
              <strong>DEAL-204</strong>
            </div>
            <div>
              <small>Supplier</small>
              <strong>Naresh Textiles</strong>
            </div>
            <div>
              <small>Deal value</small>
              <strong>{money(600000)}</strong>
            </div>
            <div>
              <small>Protection status</small>
              <Badge tone="green">Sample active record</Badge>
            </div>
          </div>
          <Button asChild>
            <Link href={"/" + role + "/claims"}>
              View claims <ArrowRight size={15} />
            </Link>
          </Button>
          <p className="ms-form-note">
            Live protection purchases require configured plans, legal terms, and
            Razorpay. Sample records are for design review.
          </p>
        </div>
      </>
    );
  if (section === "payments" || section === "enquiries")
    return (
      <>
        <PageHeading
          title={
            section === "payments" ? "Payment history" : "Business enquiries"
          }
          description={
            section === "payments"
              ? "Verified transactions and invoices will appear here."
              : "Direct enquiries from buyers will appear here."
          }
        />
        <div className="ms-card">
          <Empty
            title={
              section === "payments"
                ? "No live payments connected"
                : "No enquiries yet"
            }
            description={
              section === "payments"
                ? "Preview credit unlocks do not create payment transactions. Configure Razorpay to enable live payments."
                : "Keep your catalogue complete so buyers can discover your business."
            }
          />
        </div>
      </>
    );
  return <Empty title="Page not found" />;
}
