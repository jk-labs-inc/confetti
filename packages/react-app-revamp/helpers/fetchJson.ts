import "client-only";

type QueryParams = Record<string, string | number | boolean | undefined>;

async function readJson<T>(path: string, response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`${path} failed with ${response.status}: ${detail}`);
  }
  return response.json();
}

export async function getJson<T>(path: string, params: QueryParams): Promise<T> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  return readJson<T>(path, await fetch(`${path}?${search}`));
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return readJson<T>(path, response);
}
