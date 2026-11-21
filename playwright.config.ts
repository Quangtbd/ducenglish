import { defineConfig } from "@playwright/test";
import fs from "fs";

const localChromiumCandidates = [
  "/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell",
  "/ms-playwright/chrome-headless-shell-linux64/chrome-headless-shell",
];

const executablePath = localChromiumCandidates.find((p) => fs.existsSync(p));

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    headless: true,
    launchOptions: executablePath ? { executablePath } : undefined,
  },
});
