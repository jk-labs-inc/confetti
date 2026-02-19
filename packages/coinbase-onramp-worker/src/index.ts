import { generateJwt } from "@coinbase/cdp-sdk/auth";

interface Env {
  CDP_API_KEY: string;
  CDP_API_SECRET: string;
  ALLOWED_ORIGINS: string;
}

interface SessionRequest {
  address: string;
  chain: string;
  asset: string;
}

const CHAIN_TO_BLOCKCHAIN: Record<string, string> = {
  ethereum: "ethereum",
  mainnet: "ethereum",
  base: "base",
  arbitrumone: "arbitrum",
  arbitrum: "arbitrum",
  optimism: "optimism",
  polygon: "polygon",
  avalanche: "avalanche-c-chain",
  bnb: "bnb-chain",
  zora: "zora",
  celo: "celo",
  gnosis: "gnosis",
  scroll: "scroll",
  linea: "linea",
};

const CDP_TOKEN_URL = "https://api.developer.coinbase.com/onramp/v1/token";

const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Record<string, string>,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const getAllowedOrigins = (env: Env): string[] =>
  env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());

const getCorsHeaders = (
  origin: string | null,
  env: Env,
): Record<string, string> => {
  const allowed = getAllowedOrigins(env);
  if (origin && allowed.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };
  }
  return {};
};

const handleOptions = (request: Request, env: Env): Response => {
  const origin = request.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin, env);

  if (Object.keys(corsHeaders).length === 0) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, { status: 204, headers: corsHeaders });
};

const validateRequest = (body: unknown): body is SessionRequest => {
  if (!body || typeof body !== "object") return false;

  const { address, chain, asset } = body as Record<string, unknown>;

  if (typeof address !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(address))
    return false;
  if (typeof chain !== "string" || chain.length === 0) return false;
  if (typeof asset !== "string" || asset.length === 0) return false;

  return true;
};

const handleSession = async (request: Request, env: Env): Promise<Response> => {
  const origin = request.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin, env);

  if (origin && Object.keys(corsHeaders).length === 0) {
    return jsonResponse({ error: "Unauthorized origin" }, 403, {});
  }

  if (!env.CDP_API_KEY || !env.CDP_API_SECRET) {
    return jsonResponse(
      { error: "Server configuration error" },
      500,
      corsHeaders,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400, corsHeaders);
  }

  if (!validateRequest(body)) {
    return jsonResponse(
      { error: "Invalid request: requires address (0x...), chain, and asset" },
      400,
      corsHeaders,
    );
  }

  const { address, chain, asset } = body;

  const blockchain =
    CHAIN_TO_BLOCKCHAIN[chain.toLowerCase().replace(/\s+/g, "")];
  if (!blockchain) {
    return jsonResponse(
      { error: `Unsupported chain: ${chain}` },
      400,
      corsHeaders,
    );
  }

  const clientIp =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Real-IP") ||
    "192.0.2.1";

  let jwtToken: string;
  try {
    let processedKey = env.CDP_API_SECRET;
    if (processedKey.includes("\\n")) {
      processedKey = processedKey.replace(/\\n/g, "\n");
    }

    jwtToken = await generateJwt({
      apiKeyId: env.CDP_API_KEY,
      apiKeySecret: processedKey,
      requestMethod: "POST",
      requestHost: "api.developer.coinbase.com",
      requestPath: "/onramp/v1/token",
      expiresIn: 120,
    });
  } catch (err) {
    console.error("JWT generation failed:", err);
    return jsonResponse({ error: "Authentication failed" }, 500, corsHeaders);
  }

  const tokenRequestBody = {
    addresses: [{ address, blockchains: [blockchain] }],
    assets: [asset.toUpperCase()],
    clientIp,
  };

  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(CDP_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(tokenRequestBody),
    });
  } catch (err) {
    console.error("CDP API request failed:", err);
    return jsonResponse(
      { error: "Failed to reach Coinbase API" },
      502,
      corsHeaders,
    );
  }

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("CDP API error:", tokenResponse.status, errorText);
    return jsonResponse(
      { error: "Failed to generate session token" },
      tokenResponse.status,
      corsHeaders,
    );
  }

  let data: { token?: string; data?: { token?: string } };
  try {
    data = await tokenResponse.json();
  } catch {
    return jsonResponse(
      { error: "Invalid response from Coinbase API" },
      502,
      corsHeaders,
    );
  }

  const sessionToken = data?.token || data?.data?.token;
  if (!sessionToken) {
    return jsonResponse(
      { error: "No session token in response" },
      502,
      corsHeaders,
    );
  }

  return jsonResponse({ sessionToken }, 200, corsHeaders);
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return handleOptions(request, env);
    }

    if (url.pathname === "/session" && request.method === "POST") {
      return handleSession(request, env);
    }

    return jsonResponse({ error: "Not found" }, 404, {});
  },
};
