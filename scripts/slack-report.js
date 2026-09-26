// Posts the short report (reports/summary.json from scripts/summary-report) to Slack.
// Plain Node, no dependencies, so it runs anywhere the tests run.
const fs = require("fs");
const https = require("https");

const SUMMARY_PATH = "reports/summary.json";
const MAX_FAILED_LISTED = 10;
const MAX_ERROR_LENGTH = 500;

// SUMMARY_URL / REPORT_URL: download links of the artifacts, set by the workflow
const { SLACK_BOT_TOKEN, SLACK_CHANNEL_ID, SUMMARY_URL, REPORT_URL } = process.env;

if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
  console.error("SLACK_BOT_TOKEN / SLACK_CHANNEL_ID are not set");
  process.exit(1);
}

if (!fs.existsSync(SUMMARY_PATH)) {
  console.error(`Short report not found at ${SUMMARY_PATH}`);
  process.exit(1);
}

// summary.json already counts each test once, retries included (flaky = passed on retry)
const summary = JSON.parse(fs.readFileSync(SUMMARY_PATH, "utf8"));
const { counts } = summary;

const problems = summary.tests.filter((t) => t.status === "failed" || t.status === "flaky");

const problemsBlock = problems.length
  ? problems
      .slice(0, MAX_FAILED_LISTED)
      .map((t) => {
        const icon = t.status === "failed" ? "❌" : "⚠️";
        const error = t.error ? `\n\`\`\`\n${t.error.slice(0, MAX_ERROR_LENGTH)}\n\`\`\`` : "";
        return `${icon} *${t.title}* (\`${t.file}:${t.line}\`)${error}`;
      })
      .join("\n") +
    (problems.length > MAX_FAILED_LISTED
      ? `\n…and ${problems.length - MAX_FAILED_LISTED} more`
      : "")
  : "No failed tests 🎉";

const links = [
  summary.run?.url && `<${summary.run.url}|🔗 Run summary>`,
  SUMMARY_URL && `<${SUMMARY_URL}|📄 Short report (summary.html)>`,
  REPORT_URL && `<${REPORT_URL}|📦 Full Playwright report>`,
].filter(Boolean);

const text = [
  `${counts.failed ? "🔴" : "🟢"} *Playwright — ${summary.project} · ${summary.env}*`,
  `Total: ${counts.total} · ✅ ${counts.passed} · ❌ ${counts.failed} · ⚠️ ${counts.flaky} · ⏭ ${counts.skipped}`,
  "",
  problemsBlock,
  links.length ? `\n${links.join(" · ")}` : "",
].join("\n");

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
      const parsed = JSON.parse(body);
      if (!parsed.ok) {
        console.error(`Slack API error: ${parsed.error}`);
        process.exit(1);
      }
      console.log("Slack report sent");
    });
  },
);

req.on("error", (err) => {
  console.error("Failed to send Slack report:", err);
  process.exit(1);
});

req.write(payload);
req.end();
