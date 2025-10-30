import Image from "next/image";
import Link from "next/link";
import type { Experience } from "@/lib/api";

function toMoney(v: number | string) {
  const n = typeof v === "string" ? Number(v) : v;
  return isFinite(n) ? n.toFixed(0) : "0";
}

export default function ExperienceCard({ exp }: { exp: Experience }) {
  return (
    <div className="rounded-xl bg-white shadow p-0 overflow-hidden border border-[#EEEEEE]">
      {/* Image */}
      <div className="relative h-40 w-full">
        <Image
          src={exp.image_url}
          alt={exp.title}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, (max-width:1200px) 33vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title + tag (city) */}
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">{exp.title}</h3>
          <span className="rounded bg-[#F5F5F5] px-2 py-0.5 text-[12px] text-[#616161]">
            {exp.location}
          </span>
        </div>

        <p className="mt-1 text-[13px] leading-5 text-[#616161]">
          Curated small-group experience. Certified guide. Safety first with gear included.
        </p>

        {/* Price + CTA */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[13px] text-[#616161]">
            From <span className="ml-1 font-semibold text-black">₹{toMoney(exp.price)}</span>
          </div>
          <Link
            href={`/experiences/${exp.id}`}
            className="rounded-md px-3 py-1.5 text-[13px] font-semibold text-black shadow"
            style={{ background: "#FFD233" }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
