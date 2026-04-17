export interface SiretResult {
  siren: string;
  nom_complet: string;
  nom_raison_sociale: string;
  activite_principale: string | null;
  siege: {
    siret: string;
    adresse: string;
    geo_adresse: string;
    code_postal: string;
    libelle_commune: string;
    commune: string | null;
    numero_voie: string | null;
    type_voie: string | null;
    libelle_voie: string | null;
    complement_adresse: string | null;
    latitude: string | null;
    longitude: string | null;
  };
}

export interface SiretSearchResponse {
  results: SiretResult[];
  total_results: number;
}

export async function searchSiret(query: string): Promise<SiretResult[]> {
  if (!query || query.length < 3) return [];

  const endpoint = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&page=1&per_page=10`;

  const res = await fetch(endpoint);
  if (!res.ok) return [];

  const data: SiretSearchResponse = await res.json();
  return data.results || [];
}
