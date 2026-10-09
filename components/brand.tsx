import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand">
      <span className="mark">MS</span>
      <span>
        Mandi<span className="setu">Setu</span>
      </span>
    </Link>
  );
}
