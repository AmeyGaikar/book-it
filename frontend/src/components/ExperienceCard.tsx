import Image from "next/image";
import Link from "next/link";
import type { Experience } from "@/lib/api";

function toMoney(v: number | string) {
  const n = typeof v === "string" ? Number(v) : v;
  return isFinite(n) ? n.toFixed(0) : "0";
}

export default function ExperienceCard({ exp }: { exp: Experience }) {
  return (
    <div className="rounded-2xl bg-[#F0F0F0] shadow-md overflow-hidden border border-[#E0E0E0]">
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
        {/* Title + Location Badge */}
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[#212121]">{exp.title}</h3>
          <span className="rounded-md bg-[#E8E8E8] px-2 py-0.5 text-[12px] text-[#424242]">
            {exp.location}
          </span>
        </div>

        <p className="mt-1 text-[13px] leading-5 text-[#616161]">
          Curated small-group experience. Certified guide. Safety first with gear included.
        </p>

        {/* Price + Button */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[13px] text-[#616161]">
            From <span className="ml-1 font-semibold text-[#000000]">₹{toMoney(exp.price)}</span>
          </div>
          <Link
            href={`/experiences/${exp.id}`}
            className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-black bg-[#FFD233] hover:bg-[#ffcf1a] shadow-sm transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
