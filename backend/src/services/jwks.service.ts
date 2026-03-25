import axios from "axios";

const WELL_KNOWN_PATHS = [
  "/.well-known/openid-configuration",
  "/.well-known/jwks.json",
  "/oauth2/.well-known/openid-configuration",
];

/**
 * Probe common JWKS/OAuth endpoints on a hostname.
 * Returns the JWT signing algorithm if found, null otherwise.
 */
export async function probeJwks(hostname: string): Promise<string | null> {
  for (const path of WELL_KNOWN_PATHS) {
    try {
      const url = `https://${hostname}${path}`;
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: (s) => s === 200,
        headers: { "User-Agent": "Krow-Scanner/1.0" },
      });

      const data: any = response.data;

      // OpenID Configuration — follow jwks_uri if present.
      if (data?.jwks_uri) {
        try {
          const jwksResp = await axios.get(data.jwks_uri, {
            timeout: 5000,
            headers: { "User-Agent": "Krow-Scanner/1.0" },
          });
          const keys = jwksResp.data?.keys;
          if (Array.isArray(keys) && keys.length > 0) {
            return keys[0].alg || keys[0].kty || null;
          }
        } catch {
          // jwks_uri fetch failed, continue to next fallback.
        }
      }

      // Direct JWKS endpoint
      if (Array.isArray(data?.keys) && data.keys.length > 0) {
        return data.keys[0].alg || data.keys[0].kty || null;
      }

      // OpenID: list supported signing algs
      if (Array.isArray(data?.id_token_signing_alg_values_supported)) {
        if (data.id_token_signing_alg_values_supported.length > 0) {
          return data.id_token_signing_alg_values_supported[0];
        }
      }
    } catch {
      // Endpoint doesn't exist or can't be reached; try next.
      continue;
    }
  }

  return null;
}

