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

export async function discoverSubdomains(domain: string): Promise<DiscoveredAsset[]> {
  const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;

  const response = await axios.get<CrtShEntry[]>(url, {
    timeout: 30000,
    headers: { "User-Agent": "Krow-Scanner/1.0" },
  });

  const seen = new Set<string>();
  const assets: DiscoveredAsset[] = [];

  for (const entry of response.data) {
    const names = entry.name_value.split("\n");
    for (const raw of names) {
      const hostname = raw.trim().toLowerCase().replace(/^\*\./, "");
      if (!hostname || !hostname.includes(domain) || seen.has(hostname)) {
        continue;
      }
      seen.add(hostname);
      assets.push({
        hostname,
        firstSeenAt: entry.not_before || null,
      });
    }
  }

  return assets;
}
