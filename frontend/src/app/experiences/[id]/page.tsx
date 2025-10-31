// src/app/experiences/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";

type SearchParamsPromise = Promise<Record<string, string | string[] | undefined>>;

type Slot = {
  id: number;
  experience_id: number;
  date: string;     // ISO date
  time: string;     // e.g., "09:00 am"
  seats_left?: number | null;
  sold_out?: boolean | null;
};

type Experience = {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number | string;
  duration: string;
  category: string;
  image_url: string;
  rating: number | string;
  max_participants: number;
  slots?: Slot[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";

async function getExperience(id: string): Promise<Experience> {
  const res = await fetch(`${API_BASE}/experiences/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load experience");
  return res.json();
}

function money(n: number | string) {
  const v = typeof n === "string" ? Number(n) : n;
  return `₹${Number.isFinite(v) ? v.toFixed(0) : "0"}`;
}

function uniqueDates(slots: Slot[]): string[] {
  const set = new Set(slots.map(s => s.date));
  return Array.from(set).sort();
}
function timesForDate(slots: Slot[], date: string): Slot[] {
  return slots.filter(s => s.date === date);
}

export default async function ExperiencePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParamsPromise;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const exp = await getExperience(id);

  // Preselect via URL (?date=YYYY-MM-DD&time=09:00 am&qty=1)
  const allDates = exp.slots ? uniqueDates(exp.slots) : [];
  const urlDate = typeof sp.date === "string" ? sp.date : undefined;
  const selectedDate = urlDate && allDates.includes(urlDate) ? urlDate : allDates[0];

  const daySlots = selectedDate && exp.slots ? timesForDate(exp.slots, selectedDate) : [];
  const urlTime = typeof sp.time === "string" ? sp.time : undefined;
  const selectedTime = urlTime && daySlots.some(s => s.time === urlTime) ? urlTime : (daySlots[0]?.time ?? undefined);

  const urlQty = typeof sp.qty === "string" ? parseInt(sp.qty, 10) : undefined;
  const qty = Number.isFinite(urlQty) && (urlQty as number) > 0 ? (urlQty as number) : 1;

  const unit = typeof exp.price === "string" ? Number(exp.price) : exp.price;
  const subtotal = (Number.isFinite(unit) ? unit : 0) * qty;
  const taxes = 59; // Matches Figma mock (static)
  const total = Math.max(0, subtotal + taxes);

  const buildQuery = (overrides: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    if (selectedDate) q.set("date", selectedDate);
    if (selectedTime) q.set("time", selectedTime);
    q.set("qty", String(qty));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) return;
      q.set(k, String(v));
    });
    return q.toString();
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 py-8">
      {/* Back link + breadcrumb title strip */}
      <div className="flex items-center gap-2 text-sm text-[#616161] mb-4">
        <Link href="/" className="hover:underline">Details</Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: hero + body */}
        <div>
          <div className="relative h-[300px] md:h-[420px] w-full overflow-hidden rounded-xl shadow bg-white">
            <Image
              src={exp.image_url}
              alt={exp.title}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 60vw"
            />
          </div>

          <h1 className="mt-6 text-2xl font-semibold">{exp.title}</h1>
          <p className="mt-2 text-[#616161]">
            Curated small-group experience. Certified guide. Safety first with gear included. Helmet and Life jackets along with an expert will accompany in {exp.title.toLowerCase()}.
          </p>

          {/* Choose date */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-3">Choose date</h3>
            <div className="flex flex-wrap gap-2">
              {allDates.map((d) => (
                <Link
                  key={d}
                  href={`/experiences/${exp.id}?${buildQuery({ date: d, time: undefined })}`}
                  className={[
                    "px-3 py-1.5 rounded-md border text-sm",
                    d === selectedDate
                      ? "bg-[#FFD233] text-black border-transparent"
                      : "bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:bg-white"
                  ].join(" ")}
                >
                  {new Date(d).toLocaleDateString(undefined, { month: "short", day: "2-digit" })}
                </Link>
              ))}
            </div>
          </div>

          {/* Choose time */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Choose time</h3>
            <div className="flex flex-wrap gap-2">
              {daySlots.length === 0 && (
                <div className="text-[#9E9E9E] text-sm">No slots available for this date.</div>
              )}
              {daySlots.map((s) => {
                const isSold = Boolean(s.sold_out);
                const isSelected = s.time === selectedTime;
                return (
                  <Link
                    key={`${s.date}-${s.time}`}
                    aria-disabled={isSold}
                    href={
                      isSold
                        ? "#"
                        : `/experiences/${exp.id}?${buildQuery({ time: s.time })}`
                    }
                    className={[
                      "px-3 py-1.5 rounded-md border text-sm inline-flex items-center gap-2",
                      isSelected
                        ? "bg-[#FFD233] text-black border-transparent"
                        : "bg-white text-[#616161] border-[#E0E0E0] hover:bg-[#F5F5F5]",
                      isSold ? "opacity-60 cursor-not-allowed" : ""
                    ].join(" ")}
                  >
                    {s.time}
                    {isSold ? (
                      <span className="ml-1 rounded bg-[#E0E0E0] px-1.5 py-0.5 text-[11px] text-[#616161]">Sold out</span>
                    ) : typeof s.seats_left === "number" && s.seats_left >= 0 ? (
                      <span className="ml-1 rounded bg-[#FFF3C2] px-1.5 py-0.5 text-[11px] text-[#616161]">
                        {s.seats_left} left
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>

            <p className="mt-2 text-[12px] text-[#9E9E9E]">All times are in IST (GMT +5:30)</p>
          </div>

          {/* About strip */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2">About</h3>
            <div className="rounded-md bg-[#F5F5F5] p-3 text-[13px] text-[#616161]">
              Scenic routes, trained guides, and safety briefing. Minimum age 10.
            </div>
          </div>
        </div>

        {/* Right: summary card */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="rounded-xl border border-[#EEEEEE] bg-white shadow p-5">
            <div className="flex items-center justify-between text-sm py-2">
              <span className="text-[#616161]">Starts at</span>
              <span className="font-semibold">{money(exp.price)}</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between text-sm py-2">
              <span className="text-[#616161]">Quantity</span>
              <div className="flex items-center gap-3">
                <Link
                  href={`/experiences/${exp.id}?${buildQuery({ qty: Math.max(1, qty - 1) })}`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E0E0E0] text-[#616161] hover:bg-[#F5F5F5]"
                  aria-label="Decrease"
                >
                  –
                </Link>
                <span className="min-w-4 text-center">{qty}</span>
                <Link
                  href={`/experiences/${exp.id}?${buildQuery({ qty: qty + 1 })}`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E0E0E0] text-[#616161] hover:bg-[#F5F5F5]"
                  aria-label="Increase"
                >
                  +
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm py-2">
              <span className="text-[#616161]">Subtotal</span>
              <span className="font-semibold">{money(subtotal)}</span>
            </div>

            <div className="border-t my-3"></div>

            <div className="flex items-center justify-between text-sm py-2">
              <span className="text-[#616161]">Taxes</span>
              <span className="font-semibold">₹59</span>
            </div>

            <div className="flex items-center justify-between text-base py-2">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{money(total)}</span>
            </div>

            <Link
              href={`/checkout?exp=${exp.id}${selectedDate ? `&date=${encodeURIComponent(selectedDate)}` : ""}${selectedTime ? `&time=${encodeURIComponent(selectedTime)}` : ""}&qty=${qty}`}
              className="mt-4 block w-full rounded-md px-4 py-2 text-center font-semibold text-black shadow"
              style={{ background: "#FFD233" }}
              aria-disabled={!selectedDate || !selectedTime}
            >
              Confirm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
