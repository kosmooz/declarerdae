import { toast } from "sonner";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      accessToken = null;
      return null;
    }
    const data = await res.json();
    accessToken = data.accessToken;
    return accessToken;
  } catch {
    accessToken = null;
    return null;
  }
}

function doRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export function silentRefresh(): Promise<string | null> {
  return doRefresh();
}

interface ApiFetchOptions extends RequestInit {
  silent?: boolean;
}

export async function apiFetch(
  url: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { silent, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (!headers.has("Content-Type") && fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    const newToken = await doRefresh();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: "include",
      });
    }
  }

  // Auto-toast on errors (except 401 which is handled above)
  if (!res.ok && !silent && res.status !== 401) {
    try {
      const cloned = res.clone();
      const data = await cloned.json();
      toast.error(data.message || `Erreur ${res.status}`);
    } catch {
      toast.error(`Erreur ${res.status}`);
    }
  }

  return res;
}
