// Posts a Slack summary of the Playwright JSON report. Used by Jenkinsfile.daily.
// Node (not jq/curl) so it runs with only what's already in the Playwright Docker image.
const fs = require("fs");
const https = require("https");

const JSON_PATH = "reports/test-results.json";
const MAX_FAILED_LISTED = 10;
const MAX_ERROR_LENGTH = 500;

const { SLACK_BOT_TOKEN, SLACK_CHANNEL_ID, ENV, BUILD_URL } = process.env;

if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
  console.error("SLACK_BOT_TOKEN / SLACK_CHANNEL_ID are not set");
  process.exit(1);
}

if (!fs.existsSync(JSON_PATH)) {
  console.error(`Playwright JSON report not found at ${JSON_PATH}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

// Mirrors the suite/spec/test/results tree of Playwright's JSON reporter,
// carrying the nearest enclosing suite title down to each spec.
function collect(node, suiteTitle, out) {
  if (!node || typeof node !== "object") return;

  const currentSuite = Array.isArray(node.specs) ? node.title : suiteTitle;

  if (Array.isArray(node.specs)) {
    for (const spec of node.specs) {
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          out.push({ suite: currentSuite, title: spec.title, result });
        }
      }
    }
  }

  if (Array.isArray(node.suites)) {
    for (const suite of node.suites) collect(suite, currentSuite, out);
  }
}

const results = [];
collect(report, undefined, results);

const passed = results.filter((r) => r.result.status === "passed").length;
const failed = results.filter((r) => r.result.status === "failed").length;
const total = passed + failed;

const failedTests = results
  .filter((r) => r.result.status === "failed")
  .slice(0, MAX_FAILED_LISTED)
  .map(({ suite, title, result }) => {
    const message =
      result.error?.message ?? result.errors?.[0]?.message ?? "No error message";
    const truncated = String(message).slice(0, MAX_ERROR_LENGTH);
    return `- *${title}* (_${suite}_) \n\`\`\`\n${truncated}\n\`\`\`\n`;
  });

const failedTestsBlock = failedTests.length ? failedTests.join("") : "No failed tests 🎉";
// archiveArtifacts runs inside dir('playwright-tests') in Jenkinsfile.daily, so archived
// paths are NOT prefixed with playwright-tests/ in the build's artifact listing.
const artifactUrl = `${BUILD_URL}artifact/playwright-report/`;

const text = `*Playwright — Daily Run*
*ENV:* ${ENV}
*Total:* ${total}
✅ Passed: ${passed}
❌ Failed: ${failed}

*Failed Tests:*
${failedTestsBlock}

<${artifactUrl}|📦 Download report>`;

const payload = JSON.stringify({ channel: SLACK_CHANNEL_ID, text });

const req = https.request(
  "https://slack.com/api/chat.postMessage",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(payload),
    },
  },
  (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log(`Slack API response (${res.statusCode}): ${body}`);
      const parsed = JSON.parse(body);
      if (!parsed.ok) {
        console.error(`Slack API error: ${parsed.error}`);
        process.exit(1);
      }
    });
  },
);

req.on("error", (err) => {
  console.error("Failed to send Slack report:", err);
  process.exit(1);
});

req.write(payload);
req.end();