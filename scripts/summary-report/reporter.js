import fs from "fs";
import path from "path";

import { renderHtml, renderMarkdown } from "./render.js";

const ANSI = new RegExp("\u001b\[[0-9;]*m", "g");
const ERROR_LIMIT = 1500;

const SCREENSHOTS_PER_TEST = 2;
const SCREENSHOT_BYTES = 3 * 1024 * 1024;
const SCREENSHOT_BUDGET = 6 * 1024 * 1024;

const withoutImages = (key, value) => (key === "dataUri" ? undefined : value);

export default class SummaryReporter {
  constructor(options = {}) {
    this.outputFolder = options.outputFolder ?? "reports";
    this.project = options.project ?? process.env.ENV_PLATFORM ?? "default";
    this.env = options.env ?? process.env.ENV ?? "";
  }

  onBegin(config, suite) {
    this.config = config;
    this.suite = suite;
  }

  onEnd(result) {
    const summary = this.#buildSummary(result);

    fs.mkdirSync(this.outputFolder, { recursive: true });

    const files = {
      "summary.json": JSON.stringify(summary, withoutImages, 2),
      "summary.md": renderMarkdown(summary),
      "summary.html": renderHtml(summary),
    };

    for (const [name, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(this.outputFolder, name), content, "utf-8");
    }

    console.log(
      `Short report: ${path.join(this.outputFolder, "summary.html")} ` +
        `(passed ${summary.counts.passed}, failed ${summary.counts.failed}, ` +
        `flaky ${summary.counts.flaky}, skipped ${summary.counts.skipped})`,
    );
  }

  #buildSummary(result) {
    this.imageBudget = SCREENSHOT_BUDGET;

    const tests = (this.suite?.allTests() ?? []).map((test) => this.#describeTest(test));

    // Failures first, then flaky — the two things worth reading.
    const order = { failed: 0, flaky: 1, skipped: 2, passed: 3 };
    tests.sort((a, b) => order[a.status] - order[b.status] || a.title.localeCompare(b.title));

    const countOf = (status) => tests.filter((t) => t.status === status).length;

    return {
      project: this.project,
      env: this.env,
      status: result.status,
      startedAt: new Date(result.startTime ?? Date.now() - (result.duration ?? 0)).toISOString(),
      duration: Math.round(result.duration ?? 0),
      run: this.#runContext(),
      counts: {
        total: tests.length,
        passed: countOf("passed"),
        failed: countOf("failed"),
        flaky: countOf("flaky"),
        skipped: countOf("skipped"),
      },
      tests,
    };
  }

  #describeTest(test) {
    const outcome = test.outcome();
    const status =
      outcome === "expected" ? "passed" : outcome === "unexpected" ? "failed" : outcome; // "flaky" | "skipped"

    const failed = test.results.find((result) => result.error);
    const error = failed?.error?.message ?? failed?.errors?.[0]?.message ?? "";

    return {
      title: this.#titleOf(test),
      file: this.#relative(test.location?.file),
      line: test.location?.line ?? null,
      status,
      retries: Math.max(test.results.length - 1, 0),
      duration: test.results.reduce((sum, r) => sum + (r.duration ?? 0), 0),
      error: error ? this.#cleanError(error) : null,
      screenshots: this.#screenshotsOf(failed),
    };
  }

  #screenshotsOf(result) {
    const images = (result?.attachments ?? []).filter(
      (attachment) =>
        attachment.contentType?.startsWith("image/") && (attachment.path || attachment.body),
    );

    return images
      .slice(0, SCREENSHOTS_PER_TEST)
      .map((attachment) => this.#inlineImage(attachment))
      .filter(Boolean);
  }

  #inlineImage(attachment) {
    try {
      const body = attachment.body ?? fs.readFileSync(attachment.path);

      if (body.length > SCREENSHOT_BYTES || body.length > this.imageBudget) {
        return null;
      }

      this.imageBudget -= body.length;

      return {
        name: attachment.name ?? "screenshot",
        dataUri: `data:${attachment.contentType};base64,${body.toString("base64")}`,
      };
    } catch (error) {
      console.warn(`Short report: screenshot skipped — ${error.message}`);
      return null;
    }
  }

  #titleOf(test) {
    const parts = test.titlePath().filter(Boolean);
    const start = parts.findIndex((part) => /\.(spec\.)?[jt]s$/.test(part));

    return parts.slice(start + 1).join(" › ") || test.title;
  }

  #relative(file) {
    if (!file) return "";

    const root = this.config?.rootDir ?? process.cwd();
    return path.relative(root, file).split(path.sep).join("/");
  }

  #cleanError(message) {
    const clean = message.replace(ANSI, "").trim();

    return clean.length > ERROR_LIMIT
      ? `${clean.slice(0, ERROR_LIMIT)}\n… (full error in the detailed report)`
      : clean;
  }

  #runContext() {
    const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_RUN_NUMBER } = process.env;

    if (!GITHUB_RUN_ID) return null;

    return {
      number: GITHUB_RUN_NUMBER ?? null,
      url: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`,
    };
  }
}
