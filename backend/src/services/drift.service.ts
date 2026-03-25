import prisma from "../utils/prisma";

type DriftItem = {
  hostname: string;
  assetType: string;
  previousScore: number | null;
  currentScore: number | null;
  previousClassification: string | null;
  currentClassification: string | null;
  changeType: "regression" | "improvement" | "new" | "removed";
};

type DriftResult = {
  baselineScanId: string;
  currentScanId: string;
  baselineDomain: string;
  regressions: DriftItem[];
  improvements: DriftItem[];
  newAssets: DriftItem[];
  removedAssets: DriftItem[];
  summary: {
    totalChanged: number;
    avgScoreChange: number;
    previousAvgScore: number;
    currentAvgScore: number;
  };
};

export async function detectDrift(scanId: string): Promise<DriftResult> {
  const currentScan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      assets: { include: { riskScore: true } },
    },
  });

  if (!currentScan) throw new Error("Scan not found");

  // Find baseline scan for the same domain
  const baselineScan = await prisma.scan.findFirst({
    where: {
      domain: currentScan.domain,
      isBaseline: true,
      id: { not: scanId },
    },
    include: {
      assets: { include: { riskScore: true } },
    },
    orderBy: { completedAt: "desc" },
  });

  if (!baselineScan) {
    await prisma.scan.update({
      where: { id: scanId },
      data: { isBaseline: true },
    });

    return {
      baselineScanId: scanId,
      currentScanId: scanId,
      baselineDomain: currentScan.domain,
      regressions: [],
      improvements: [],
      newAssets: currentScan.assets.map((a) => ({
        hostname: a.hostname,
        assetType: a.assetType,
        previousScore: null,
        currentScore: a.riskScore?.totalScore ?? null,
        previousClassification: null,
        currentClassification: a.riskScore?.classification ?? null,
        changeType: "new" as const,
      })),
      removedAssets: [],
      summary: {
        totalChanged: currentScan.assets.length,
        avgScoreChange: 0,
        previousAvgScore: 0,
        currentAvgScore:
          currentScan.assets.reduce((sum, a) => sum + (a.riskScore?.totalScore ?? 0), 0) /
          (currentScan.assets.length || 1),
      },
    };
  }

  const baselineMap = new Map(baselineScan.assets.map((a) => [a.hostname, a]));
  const currentMap = new Map(currentScan.assets.map((a) => [a.hostname, a]));

  const regressions: DriftItem[] = [];
  const improvements: DriftItem[] = [];
  const newAssets: DriftItem[] = [];
  const removedAssets: DriftItem[] = [];

  for (const [hostname, current] of currentMap) {
    const baseline = baselineMap.get(hostname);

    if (!baseline) {
      newAssets.push({
        hostname,
        assetType: current.assetType,
        previousScore: null,
        currentScore: current.riskScore?.totalScore ?? null,
        previousClassification: null,
        currentClassification: current.riskScore?.classification ?? null,
        changeType: "new",
      });
      continue;
    }

    const prevScore = baseline.riskScore?.totalScore ?? 0;
    const currScore = current.riskScore?.totalScore ?? 0;
    const diff = currScore - prevScore;

    if (diff > 5) {
      regressions.push({
        hostname,
        assetType: current.assetType,
        previousScore: prevScore,
        currentScore: currScore,
        previousClassification: baseline.riskScore?.classification ?? null,
        currentClassification: current.riskScore?.classification ?? null,
        changeType: "regression",
      });
    } else if (diff < -5) {
      improvements.push({
        hostname,
        assetType: current.assetType,
        previousScore: prevScore,
        currentScore: currScore,
        previousClassification: baseline.riskScore?.classification ?? null,
        currentClassification: current.riskScore?.classification ?? null,
        changeType: "improvement",
      });
    }
  }

  for (const [hostname, baseline] of baselineMap) {
    if (!currentMap.has(hostname)) {
      removedAssets.push({
        hostname,
        assetType: baseline.assetType,
        previousScore: baseline.riskScore?.totalScore ?? null,
        currentScore: null,
        previousClassification: baseline.riskScore?.classification ?? null,
        currentClassification: null,
        changeType: "removed",
      });
    }
  }

  const prevAvg =
    baselineScan.assets.reduce((sum, a) => sum + (a.riskScore?.totalScore ?? 0), 0) /
    (baselineScan.assets.length || 1);
  const currAvg =
    currentScan.assets.reduce((sum, a) => sum + (a.riskScore?.totalScore ?? 0), 0) /
    (currentScan.assets.length || 1);

  return {
    baselineScanId: baselineScan.id,
    currentScanId: scanId,
    baselineDomain: currentScan.domain,
    regressions,
    improvements,
    newAssets,
    removedAssets,
    summary: {
      totalChanged: regressions.length + improvements.length + newAssets.length + removedAssets.length,
      avgScoreChange: Math.round(currAvg - prevAvg),
      previousAvgScore: Math.round(prevAvg),
      currentAvgScore: Math.round(currAvg),
    },
  };
}

