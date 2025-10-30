// src/app/page.tsx
import ExperienceCard from "@/components/ExperienceCard";
import { fetchExperiences, type Experience } from "@/lib/api";

type SearchParamsPromise = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : undefined;

  const experiences: Experience[] = await fetchExperiences(search);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 py-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {experiences.map((exp: Experience) => (
          <ExperienceCard key={exp.id} exp={exp} />
        ))}
      </div>

      {experiences.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-[#E0E0E0] bg-white p-10 text-center text-[#616161]">
          No experiences found.
        </div>
      )}
    </div>
  );
}
