import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export async function createScan(domain: string) {
  const { data } = await api.post("/scans", { domain });
  return data;
}

export async function getScans() {
  const { data } = await api.get("/scans");
  return data;
}

export async function getScan(id: string) {
  const { data } = await api.get(`/scans/${id}`);
  return data;
}

export async function getScanAssets(scanId: string) {
  const { data } = await api.get(`/scans/${scanId}/assets`);
  return data;
}

export async function getAsset(id: string) {
  const { data } = await api.get(`/assets/${id}`);
  return data;
}

export async function getDashboardSummary() {
  const { data } = await api.get("/dashboard/summary");
  return data;
}

export async function getHeatmapData() {
  const { data } = await api.get("/dashboard/heatmap");
  return data;
}

export function getCbomDownloadUrl(scanId: string) {
  return `/api/scans/${scanId}/cbom`;
}

export async function verifyBadge(badgeId: string) {
  const { data } = await api.get(`/badges/verify/${badgeId}`);
  return data;
}

export async function getRecommendation(assetId: string) {
  const { data } = await api.get(`/assets/${assetId}/recommendation`);
  return data;
}

export async function getScanDrift(scanId: string) {
  const { data } = await api.get(`/scans/${scanId}/drift`);
  return data;
}

export default api;
