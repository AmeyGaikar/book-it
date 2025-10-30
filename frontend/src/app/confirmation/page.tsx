// src/app/confirmation/page.tsx
import Link from "next/link";

type SearchParamsPromise = Promise<Record<string, string | string[] | undefined>>;

function makeRef() {
  const base = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "HD";
  for (let i = 0; i < 6; i++) out += base[Math.floor(Math.random() * base.length)];
  return out;
}

export default async function Confirmation({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : makeRef();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 md:px-8 py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#E8F6EF" }}>
        <div className="h-9 w-9 rounded-full" style={{ background: "#009966" }} />
      </div>

      <h1 className="text-2xl font-semibold">Booking Confirmed</h1>
      <p className="mt-2 text-[#616161]">Ref ID: {ref}</p>

      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-[#E0E0E0] px-4 py-2 text-sm text-[#212121]"
      >
        Back to Home
      </Link>
    </div>
  );
}
