"use client";
import { useState } from "react";

interface PromoCodeInputProps {
  subtotal: number;
  onApply: (finalAmount: number, discountAmount: number, code: string) => void;
}

export default function PromoCodeInput({ subtotal, onApply }: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";

  async function handleApply() {
    if (!code.trim()) {
      setMessage("Please enter a promo code");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/promo/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: subtotal }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setMessage(data.error || "Invalid or expired code");
      } else {
        setMessage(`✅ Applied ${data.code} (-₹${data.discountAmount.toFixed(0)})`);
        onApply(data.finalAmount, data.discountAmount, data.code);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error applying promo code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <label className="block text-sm font-medium text-[#616161] mb-1">
        Promo code
      </label>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className="w-full rounded-md border border-[#E0E0E0] bg-[#F5F5F5] px-4 py-2 outline-none focus:border-black"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading}
          className="rounded-md px-4 py-2 font-semibold text-white"
          style={{ background: "#000000" }}
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </div>
      {message && (
        <p className="text-sm mt-2 text-[#616161]">{message}</p>
      )}
    </div>
  );
}
