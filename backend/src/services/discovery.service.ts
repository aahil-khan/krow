import axios from "axios";

interface CrtShEntry {
  id: number;
  issuer_ca_id: number;
  issuer_name: string;
  common_name: string;
  name_value: string;
  not_before: string;
  not_after: string;
}

export interface DiscoveredAsset {
  hostname: string;
  firstSeenAt: string | null;
}

export type DiscoveryMode = "CRT_SH" | "FALLBACK_ROOT";

function fallbackToRootDomain(domain: string): DiscoveredAsset[] {
  return [
    {
      hostname: domain.toLowerCase(),
      firstSeenAt: null,
    },
  ];
}

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/^\*\./, "");
}

function isDomainHost(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function discoverSubdomainsDetailed(
  domainInput: string,
): Promise<{ assets: DiscoveredAsset[]; mode: DiscoveryMode }> {
  const domain = domainInput.toLowerCase();
  const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
  const attempts = 3;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await axios.get<CrtShEntry[]>(url, {
        timeout: 30000,
        headers: { "User-Agent": "Krow-Scanner/1.0" },
      });

      if (!Array.isArray(response.data)) {
        if (attempt < attempts) await sleep(700 * attempt);
        continue;
      }

      const seen = new Set<string>();
      const assets: DiscoveredAsset[] = [];

      for (const entry of response.data) {
        const names = entry.name_value.split("\n");
        for (const raw of names) {
          const hostname = normalizeHost(raw);
          if (!hostname || !isDomainHost(hostname, domain) || seen.has(hostname)) {
            continue;
          }
          seen.add(hostname);
          assets.push({
            hostname,
            firstSeenAt: entry.not_before || null,
          });
        }
      }

      if (assets.length > 0) {
        return { assets, mode: "CRT_SH" };
      }
    } catch (error) {
      if (attempt === attempts) {
        console.warn(`crt.sh discovery failed for ${domain}. Falling back to root domain.`, error);
      }
    }

    if (attempt < attempts) await sleep(700 * attempt);
  }

  console.warn(`No subdomains from crt.sh for ${domain}. Falling back to root domain.`);
  return { assets: fallbackToRootDomain(domain), mode: "FALLBACK_ROOT" };
}

export async function discoverSubdomains(domain: string): Promise<DiscoveredAsset[]> {
  const result = await discoverSubdomainsDetailed(domain);
  return result.assets;
}
