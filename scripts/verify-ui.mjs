import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const base = process.env.PREVIEW_URL || "http://localhost:3000";
const sellerBase = process.env.SELLER_URL || "http://localhost:3001";
const adminBase = process.env.ADMIN_URL || "http://localhost:3002";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await Promise.all(
  ["users/artifacts", "seller/artifacts", "admin/artifacts"].map((path) =>
    mkdir(path, { recursive: true }),
  ),
);
try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "Your direct factory-to-buyer marketplace" })
    .waitFor();
  await page.screenshot({
    path: "users/artifacts/home-desktop.png",
    fullPage: true,
  });
  await page.goto(sellerBase + "/seller/dashboard");
  await page.getByRole("heading", { name: /Good morning, Naresh/ }).waitFor();
  await page.screenshot({
    path: "seller/artifacts/seller-desktop.png",
    fullPage: true,
  });
  await page.goto(sellerBase + "/seller/leads");
  const lead = page
    .locator(".ms-lead-card")
    .filter({ hasText: "Cotton T-shirts for corporate uniforms" });
  await lead.getByRole("button", { name: /Unlock buyer contact/ }).click();
  await lead.getByRole("link", { name: "rahul@example.com" }).waitFor();
  await page.reload();
  await lead.getByRole("link", { name: "rahul@example.com" }).waitFor();
  assert.equal(
    await lead.getByRole("button", { name: /Unlock buyer contact/ }).count(),
    0,
  );
  console.log(
    "PASS: credit unlock reveals contact, prevents duplicates, and persists",
  );
  await page.goto(base + "/buyer/requirements/create");
  await page.getByRole("button", { name: "Post requirement — free" }).click();
  await page.getByText("Enter at least 5 characters").waitFor();
  await page
    .getByLabel("What are you looking for?")
    .fill("Test cotton uniforms");
  await page
    .getByLabel("Category", { exact: true })
    .selectOption("Raw Textiles");
  await page.getByLabel("Quantity", { exact: true }).fill("1000");
  await page.getByLabel("Approximate budget (₹)").fill("120000");
  await page.getByLabel("Delivery city").fill("Delhi");
  await page.getByLabel("Required by").fill("2026-11-20");
  await page
    .getByLabel("Requirement details")
    .fill("Custom navy cotton uniforms with embroidered company branding.");
  await page.getByRole("button", { name: "Post requirement — free" }).click();
  await page.getByRole("heading", { name: "Test cotton uniforms" }).waitFor();
  await page.getByText("Pending", { exact: true }).waitFor();
  console.log(
    "PASS: validated free requirement posting creates a pending request",
  );
  await page.goto(adminBase + "/admin/leads");
  const adminLead = page
    .locator(".ms-lead-card")
    .filter({ hasText: "Custom printed packaging boxes" });
  await adminLead.locator("select").selectOption("Active");
  await page.reload();
  await adminLead.locator(".ms-badge").filter({ hasText: "Active" }).waitFor();
  console.log(
    "PASS: independent admin lead review persists in admin preview state",
  );
  await page.goto(sellerBase + "/seller/leads");
  await page
    .getByRole("heading", { name: "Cotton T-shirts for corporate uniforms" })
    .waitFor();
  assert.equal(
    await page
      .getByRole("heading", { name: "Custom printed packaging boxes" })
      .count(),
    0,
  );
  console.log("PASS: independent seller app filters category-matched leads");
  await page.getByText("14 credits available", { exact: true }).waitFor();
  await page.goto(base + "/products?category=Raw%20Textiles");
  await page
    .getByRole("heading", { name: "Premium cotton T-shirts" })
    .waitFor();
  await page
    .getByRole("button", { name: "Save Premium cotton T-shirts" })
    .click();
  await page.goto(base + "/buyer/saved");
  await page
    .getByRole("heading", { name: "Premium cotton T-shirts" })
    .waitFor();
  console.log("PASS: catalogue filtering and product shortlist");
  for (const [role, heading] of [
    ["admin", "Marketplace overview"],
    ["buyer", /Good morning, Rahul/],
  ]) {
    await page.goto(
      (role === "admin" ? adminBase : base) + "/" + role + "/dashboard",
    );
    await page.getByRole("heading", { name: heading }).waitFor();
    await page.screenshot({
      path: `${role === "buyer" ? "users" : "admin"}/artifacts/${role}-desktop.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(sellerBase + "/seller/dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .locator(".ms-sidebar")
    .getByRole("link", { name: "Lead marketplace" })
    .click();
  await page.getByRole("heading", { name: "Lead marketplace" }).waitFor();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    ),
    false,
    "Mobile panel fits viewport",
  );
  await page.screenshot({
    path: "seller/artifacts/seller-mobile.png",
    fullPage: true,
  });
  await page.goto(base);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("link", { name: "Browse products", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Discover products & manufacturers" })
    .waitFor();
  console.log("PASS: mobile panel and homepage navigation");
  assert.deepEqual(errors, [], "No unhandled frontend exceptions");
  console.log(
    "UI verification passed. Screenshots saved in each application's artifacts folder.",
  );
} finally {
  await browser.close();
}
