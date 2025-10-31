export type Experience = {
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
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

export async function fetchExperiences(search?: string) {
  const url = new URL(`${API_URL}/experiences`);
  if (search && search.trim()) url.searchParams.set("search", search.trim());

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load experiences");
  return res.json();
}
