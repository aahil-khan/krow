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

export async function getLatestCompletedScan() {
  const scans = await getScans();
  return scans.find((s: { status: string }) => s.status === "COMPLETED") ?? null;
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

export async function getCbomData(scanId: string) {
  const { data } = await api.get(`/scans/${scanId}/cbom`);
  return data;
}

export function getCbomPdfUrl(scanId: string) {
  return `/api/scans/${scanId}/cbom/pdf`;
}

export function getCbomExcelUrl(scanId: string) {
  return `/api/scans/${scanId}/cbom/excel`;
}

export function getComplianceReportUrl(scanId: string) {
  return `/api/scans/${scanId}/report`;
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

export async function getBadge(id: string) {
  const { data } = await api.get(`/badges/${id}`);
  return data;
}

export default api;
