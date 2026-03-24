export function isValidDomain(domain: string): boolean {
  const cleaned = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .toLowerCase();

  // Basic domain validation
  const domainRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
  return domainRegex.test(cleaned);
}

export function cleanDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .replace(/^www\./, "")
    .toLowerCase()
    .trim();
}

export function isValidScanId(id: string): boolean {
  // Prisma cuid format: starts with 'c', 25 chars
  return /^c[a-z0-9]{24}$/.test(id);
}
