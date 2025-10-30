"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "../../public/HDlogo-1.png"

export default function Navbar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState("");

  // Keep input in sync with URL ?search=
  useEffect(() => {
    const current = params.get("search") ?? "";
    setQ(current);
  }, [params]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    const target = query ? `/?search=${encodeURIComponent(query)}` : "/";
    router.push(target);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src={Logo}
              alt="Highway Delite"
              width={60}
              height={32}
              priority
              className="h-8 w-auto"
            />
          </div>

          {/* Search */}
          <form
            onSubmit={onSubmit}
            className="flex w-[320px] sm:w-[360px] md:w-[440px] items-center gap-3"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Search experiences"
              className="w-full rounded-md border border-[#E0E0E0] bg-[#F5F5F5] px-4 py-2 text-[15px] leading-6 placeholder-[#9E9E9E] outline-none focus:border-black"
            />
            <button
              type="submit"
              className="rounded-md px-4 py-2 font-semibold text-black shadow"
              style={{ background: "#FFD233" }}
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
