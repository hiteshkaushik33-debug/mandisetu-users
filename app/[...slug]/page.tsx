import { Suspense } from "react";
import { PublicRoute } from "@/components/public-view";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="ms-loading">Loading MandiSetu…</div>}>
      <PublicRoute slug={slug} />
    </Suspense>
  );
}
