"use client";
import { useMarketplace } from "@/lib/store";
import { Button } from "@/components/ui/button";
export function ProfileForm({ seller = false }: { seller?: boolean }) {
  const { state, update, notify } = useMarketplace();
  const source = seller
    ? {
        name: state.sellers[0].name,
        company: state.sellers[0].company,
        email: state.sellers[0].email,
        phone: state.sellers[0].phone,
        city: state.sellers[0].city,
      }
    : state.profile;
  return (
    <form
      className="ms-card ms-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const v = Object.fromEntries(
          Object.keys(source).map((k) => [k, String(f.get(k))]),
        ) as typeof source;
        update((s) =>
          seller
            ? {
                ...s,
                sellers: s.sellers.map((x, i) =>
                  i === 0 ? { ...x, ...v } : x,
                ),
              }
            : { ...s, profile: v },
        );
        notify("Profile saved in preview.");
      }}
    >
      <div className="ms-form-grid">
        {Object.entries(source).map(([k, v]) => (
          <label className="ms-field" key={k}>
            {k === "company"
              ? "Company name"
              : k.charAt(0).toUpperCase() + k.slice(1)}
            <input
              name={k}
              defaultValue={v}
              required
              type={k === "email" ? "email" : "text"}
            />
          </label>
        ))}
      </div>
      <Button>Save profile</Button>
    </form>
  );
}
