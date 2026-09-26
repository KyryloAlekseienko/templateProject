import { defineConfig, devices } from "@playwright/test";
import { testConfig } from "./configs/config";

export default defineConfig({
  testDir: "./tests",

  snapshotPathTemplate: "{testDir}/__snapshots__/{testFilePath}/{arg}{ext}",

  timeout: 100 * 1000,

  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      caret: "hide",
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    // "github" turns failures into annotations on the PR diff
    process.env.CI ? ["github"] : ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "reports/test-results.json" }],
    // Short report: reports/summary.{md,html,json}, see scripts/summary-report
    ["./scripts/summary-report/reporter.js", { outputFolder: "reports", project: "webmodule" }],
  ],

  use: {
    actionTimeout: 10_000,
    baseURL: testConfig.baseUrl,
    deviceScaleFactor: 1,
    headless: !!process.env.CI,
    navigationTimeout: 15_000,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    {
      name: "setup",
      testMatch: "**/*.setup.ts",
    },

    {
      name: "chromium",
      // testIgnore: [
      //   "tests/login.spec.ts",
      // ],
      use: {
        ...devices["Desktop Chrome"],
        //storageState: "auth/storageState.json",
      },
      //dependencies: ["setup"],
    },

    // {
    //   name: "loginPage",
    //   testMatch: "tests/login.spec.ts",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     storageState: undefined,
    //   },
    // },
  ],
});
