"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useMarketplace } from "@/lib/store";
import { type Role } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/marketplace";
import { PageHeading } from "@/components/page-heading";
export function BuyerClaims() {
  const role = "buyer" as Role;
  const { state, update, notify } = useMarketplace();
  const [adding, setAdding] = useState(false);
  return (
    <>
      <PageHeading
        title={"My protection claims"}
        description="Evidence from both sides is reviewed manually. A claim does not automatically affect supplier reputation."
        action={
          <Button onClick={() => setAdding(!adding)}>
            <Plus size={16} />
            Raise a claim
          </Button>
        }
      />
      {adding && (
        <form
          className="ms-card ms-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            update((s) => ({
              ...s,
              claims: [
                ...s.claims,
                {
                  id: "CLM-" + Date.now().toString().slice(-5),
                  title: String(f.get("title")),
                  sellerId: "seller-1",
                  amount: Number(f.get("amount")),
                  reason: String(f.get("reason")),
                  status: "Under Review",
                  response: "",
                  reference: String(f.get("reference")),
                },
              ],
            }));
            setAdding(false);
            notify("Claim submitted for manual review in preview.");
          }}
        >
          <div className="ms-form-grid">
            <label className="ms-field">
              Deal title
              <input name="title" required />
            </label>
            <label className="ms-field">
              Deal reference
              <input name="reference" required />
            </label>
            <label className="ms-field">
              Requested amount (₹)
              <input type="number" name="amount" min="1" required />
            </label>
          </div>
          <label className="ms-field">
            Claim explanation
            <textarea name="reason" minLength={10} required rows={4} />
          </label>
          <Button>Submit for review</Button>
        </form>
      )}
      {state.claims.map((c) => (
        <div className="ms-card ms-claim-card" key={c.id}>
          <div className="ms-card-heading">
            <div>
              <h2>{c.title}</h2>
              <p>
                {c.id} · {c.reference} · {money(c.amount)}
              </p>
            </div>
            <Badge tone="amber">{c.status}</Badge>
          </div>
          <h3>Buyer explanation</h3>
          <p>{c.reason}</p>
          <h3>Supplier response</h3>
          <p>
            {c.response ||
              "Awaiting supplier response. No reputation change has been made."}
          </p>
        </div>
      ))}
    </>
  );
}
