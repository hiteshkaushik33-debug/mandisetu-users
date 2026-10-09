import type { Role } from "./data";
const sellerDashboardUrl =
  "https://mandisetu-sellers.vercel.app/seller/dashboard";
const adminOrigin = "https://mandisetu-admin.vercel.app/admin/dashboard";
export function appHref(role: Role, path: string): string {
  if (role === "seller") return sellerDashboardUrl;
  return role === "buyer" ? path : adminOrigin.replace(/\/$/, "") + path;
}
