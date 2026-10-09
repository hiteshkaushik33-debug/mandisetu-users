"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  initialSellers,
  initialProducts,
  initialLeads,
  initialPlans,
  initialClaims,
  type Seller,
  type Product,
  type Lead,
  type Claim,
  type Plan,
  type Role,
} from "./data";
type State = {
  sellers: Seller[];
  products: Product[];
  leads: Lead[];
  claims: Claim[];
  plans: Plan[];
  saved: string[];
  profile: {
    name: string;
    company: string;
    email: string;
    phone: string;
    city: string;
  };
  activity: string[];
  cms: Record<string, string>;
};
const initial: State = {
  sellers: initialSellers,
  products: initialProducts,
  leads: initialLeads,
  claims: initialClaims,
  plans: initialPlans,
  saved: [],
  profile: {
    name: "Rahul Mehta",
    company: "Mehta Enterprises",
    email: "rahul@example.com",
    phone: "+91 90000 00101",
    city: "Delhi",
  },
  activity: [
    "Your requirement RFQ-1042 has been matched with relevant suppliers.",
    "Welcome to the MandiSetu preview.",
  ],
  cms: {
    about:
      "MandiSetu connects buyers with manufacturers across India. Post a free requirement and find relevant suppliers for your business.",
    faq: "Requirements are free for buyers. Up to five relevant suppliers can unlock each lead. Business deals are negotiated directly between buyers and sellers.",
  },
};
type Store = {
  state: State;
  ready: boolean;
  role: Role | null;
  toast: string;
  setRole: (r: Role | null) => void;
  update: (fn: (s: State) => State) => void;
  notify: (s: string) => void;
  unlock: (id: string) => void;
  save: (id: string) => void;
};
const Context = createContext<Store | null>(null);
export function MarketplaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  const [role, setRoleState] = useState<Role | null>(null);
  const [toast, setToast] = useState("");
  useEffect(() => {
    try {
      const s = localStorage.getItem("mandisetu-preview-v1");
      if (s) setState(JSON.parse(s));
      const r = sessionStorage.getItem("mandisetu-preview-role");
      if (r === "buyer" || r === "seller" || r === "admin") setRoleState(r);
    } catch {
      /* malformed storage returns to seeded preview */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      localStorage.setItem("mandisetu-preview-v1", JSON.stringify(state));
  }, [state, ready]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  const notify = (message: string) => setToast(message);
  const update = (fn: (s: State) => State) => setState(fn);
  const setRole = (r: Role | null) => {
    setRoleState(r);
    if (r) sessionStorage.setItem("mandisetu-preview-role", r);
    else sessionStorage.removeItem("mandisetu-preview-role");
  };
  const unlock = (id: string) => {
    const lead = state.leads.find((l) => l.id === id);
    const seller = state.sellers[0];
    if (!lead || lead.category !== seller.category)
      return notify("This lead does not match your business category.");
    if (lead.purchases.includes(seller.id))
      return notify("You already unlocked this lead.");
    if (
      !["Active", "Partially Sold"].includes(lead.status) ||
      lead.purchases.length >= 5
    )
      return notify("This lead is unavailable.");
    if (lead.price > 0 && seller.credits <= 0)
      return notify(
        "No credits left. Paid unlocking requires the configured payment service.",
      );
    update((s) => {
      const current = s.leads.find((l) => l.id === id)!;
      const owner = s.sellers[0];
      if (
        current.purchases.length >= 5 ||
        current.purchases.includes(owner.id) ||
        (current.price > 0 && owner.credits <= 0)
      )
        return s;
      return {
        ...s,
        sellers: s.sellers.map((x) =>
          x.id === owner.id
            ? { ...x, credits: x.credits - (current.price > 0 ? 1 : 0) }
            : x,
        ),
        leads: s.leads.map((l) =>
          l.id === id
            ? {
                ...l,
                purchases: [...l.purchases, owner.id],
                status:
                  l.purchases.length === 4 ? "Fully Sold" : "Partially Sold",
              }
            : l,
        ),
        activity: [
          `${id} unlocked ${current.price > 0 ? "with one lead credit" : "for free"}.`,
          ...s.activity,
        ],
      };
    });
    notify("Lead unlocked in preview. Buyer contact is now available.");
  };
  const save = (id: string) =>
    update((s) => ({
      ...s,
      saved: s.saved.includes(id)
        ? s.saved.filter((x) => x !== id)
        : [...s.saved, id],
    }));
  return (
    <Context.Provider
      value={{
        state,
        ready,
        role,
        toast,
        setRole,
        update,
        notify,
        unlock,
        save,
      }}
    >
      {children}
      {toast && (
        <div className="ms-toast" role="status">
          {toast}
        </div>
      )}
    </Context.Provider>
  );
}
export function useMarketplace() {
  const s = useContext(Context);
  if (!s) throw new Error("Marketplace provider is missing");
  return s;
}
