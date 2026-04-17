/** Wrapper pour l'API BAN (Base Adresse Nationale) — api-adresse.data.gouv.fr */

export interface GeocodingResult {
  label: string;
  housenumber: string;
  street: string;
  postcode: string;
  city: string;
  citycode: string;
  latitude: number;
  longitude: number;
  score: number;
}

export async function geocodeAddress(
  query: string,
  postcode?: string,
): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 3) return [];

  const params = new URLSearchParams({ q: query.trim(), limit: "5" });
  if (postcode) params.set("postcode", postcode);

  try {
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?${params}`,
    );
    if (!res.ok) return [];

    const data = await res.json();

    return (data.features || []).map((f: any) => ({
      label: f.properties.label || "",
      housenumber: f.properties.housenumber || "",
      street: f.properties.street || f.properties.name || "",
      postcode: f.properties.postcode || "",
      city: f.properties.city || "",
      citycode: f.properties.citycode || "",
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      score: f.properties.score || 0,
    }));
  } catch {
    return [];
  }
}
