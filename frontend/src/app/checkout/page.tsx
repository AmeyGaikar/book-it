"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PromoCodeInput from "@/components/PromoCodeInput";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

type SearchParamsPromise = Promise<
  Record<string, string | string[] | undefined>
>;

function money(n: number | string) {
  const v = typeof n === "string" ? Number(n) : n;
  return `₹${Number.isFinite(v) ? v.toFixed(0) : "0"}`;
}

async function getExperience(expId: string) {
  const res = await fetch(`${API_BASE}/experiences/${expId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load experience");
  return res.json();
}

export default function Checkout({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const [exp, setExp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [subtotal, setSubtotal] = useState(0);
  const [taxes, setTaxes] = useState(59);
  const [total, setTotal] = useState(0);

  const [finalTotal, setFinalTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [expId, setExpId] = useState<string | null>(null);

  // ✅ Extract search params and fetch experience
  useEffect(() => {
    async function init() {
      const sp = await searchParams;

      const expParam = typeof sp.exp === "string" ? sp.exp : undefined;
      const dateParam = typeof sp.date === "string" ? sp.date : undefined;
      const timeParam = typeof sp.time === "string" ? sp.time : undefined;
      const qtyParam = typeof sp.qty === "string" ? parseInt(sp.qty, 10) : 1;
      const finalQty = Number.isFinite(qtyParam) && qtyParam > 0 ? qtyParam : 1;

      if (!expParam) {
        setLoading(false);
        return;
      }

      setExpId(expParam);
      setDate(dateParam ?? null);
      setTime(timeParam ?? null);
      setQty(finalQty);

      try {
        const expData = await getExperience(expParam);
        setExp(expData);

        const unit = typeof expData.price === "string" ? Number(expData.price) : expData.price;
        const sub = (Number.isFinite(unit) ? unit : 0) * finalQty;
        const totalVal = Math.max(0, sub + 59);

        setSubtotal(sub);
        setTotal(totalVal);
        setFinalTotal(totalVal);
      } catch (err) {
        console.error("Error loading experience:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [searchParams]);

  // ✅ Handler for promo code application
  function handlePromoApply(newTotal: number, discountAmount: number, code: string) {
    setFinalTotal(newTotal + taxes);
    setDiscount(discountAmount);
    setAppliedCode(code);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-10 text-center">
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (!expId || !exp) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-10">
        <div className="rounded-xl border border-dashed border-[#E0E0E0] bg-white p-10 text-center text-[#616161]">
          Missing experience ID.{" "}
          <Link className="underline" href="/">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-[#616161] mb-4">
        <Link href={`/experiences/${exp.id}`} className="hover:underline">
          Checkout
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* ✅ Left: form */}
        <form
          action="/confirmation"
          className="rounded-xl border border-[#EEEEEE] bg-white shadow p-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#616161] mb-1">
                Full name
              </label>
              <input
                name="name"
                placeholder="Your name"
                className="w-full rounded-md border border-[#E0E0E0] bg-[#F5F5F5] px-4 py-2 outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#616161] mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="Your email"
                className="w-full rounded-md border border-[#E0E0E0] bg-[#F5F5F5] px-4 py-2 outline-none focus:border-black"
              />
            </div>
          </div>

          {/* ✅ Promo code input */}
          <PromoCodeInput subtotal={subtotal} onApply={handlePromoApply} />

          <label className="mt-5 flex items-center gap-2 text-sm text-[#616161]">
            <input type="checkbox" required className="h-4 w-4" /> I agree to
            the terms and safety policy
          </label>

          {/* Hidden fields */}
          <input type="hidden" name="exp" value={exp.id} />
          {date && <input type="hidden" name="date" value={date} />}
          {time && <input type="hidden" name="time" value={time} />}
          <input type="hidden" name="qty" value={qty} />
          <input type="hidden" name="total" value={finalTotal} />

          <button
            type="submit"
            className="mt-6 rounded-md px-4 py-2 font-semibold text-black shadow"
            style={{ background: "#FFD233" }}
          >
            Pay and Confirm
          </button>
        </form>

        {/* ✅ Right: summary */}
        <div className="rounded-xl border border-[#EEEEEE] bg-white shadow p-5 h-fit">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#616161]">Experience</span>
              <span className="font-semibold">{exp.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#616161]">Date</span>
              <span className="font-semibold">{date ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#616161]">Time</span>
              <span className="font-semibold">{time ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#616161]">Qty</span>
              <span className="font-semibold">{qty}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[#616161]">Subtotal</span>
              <span className="font-semibold">{money(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#616161]">Taxes</span>
              <span className="font-semibold">₹{taxes}</span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-700">
                <span>Promo ({appliedCode})</span>
                <span>-₹{discount.toFixed(0)}</span>
              </div>
            )}

            <div className="border-t my-3" />
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{money(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
