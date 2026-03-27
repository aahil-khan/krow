import fs from "fs";

/**
 * Path to a Chrome/Chromium binary for puppeteer-core (no bundled browser).
 * Set `PUPPETEER_EXECUTABLE_PATH` or `CHROME_PATH` in production/Docker.
 */
export function resolveChromeExecutablePath(): string {
  const fromEnv =
    process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || process.env.GOOGLE_CHROME_BIN;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  const candidates: string[] = [];

  if (process.platform === "win32") {
    candidates.push(
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    );
    if (process.env.LOCALAPPDATA) {
      candidates.push(`${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`);
    }
    candidates.push(
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    );
  } else if (process.platform === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    );
  } else {
    candidates.push(
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    );
  }

  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }

  throw new Error(
    "PDF export requires Chrome or Edge. Install Google Chrome, or set PUPPETEER_EXECUTABLE_PATH to the full path of chrome.exe / msedge / chromium.",
  );
}
