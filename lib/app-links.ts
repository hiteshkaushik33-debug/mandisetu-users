import type { Role } from "./data";
const sellerDashboardUrl =
  "https://mandisetu-sellers.vercel.app/seller/dashboard";
const adminOrigin = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002";
export function appHref(role: Role, path: string): string {
  if (role === "seller") return sellerDashboardUrl;
  return role === "buyer" ? path : adminOrigin.replace(/\/$/, "") + path;
}
