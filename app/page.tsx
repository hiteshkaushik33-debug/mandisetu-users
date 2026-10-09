import { Home } from "@/components/home";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<div className="ms-loading">Loading MandiSetu…</div>}>
      <Home />
    </Suspense>
  );
}
