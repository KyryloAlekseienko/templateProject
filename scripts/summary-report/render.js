// Rendering of the short report. Everything is inlined into a single HTML file
// (no assets, no JS) so it stays a few KB and opens straight from the artifact.

const STATUS = {
  passed: { label: "Passed", icon: "✅", role: "good" },
  failed: { label: "Failed", icon: "❌", role: "critical" },
  flaky: { label: "Flaky", icon: "⚠️", role: "warning" },
  skipped: { label: "Skipped", icon: "⏭", role: "muted" },
};

const MD_ERROR_LIMIT = 600;

export function formatDuration(ms) {
  if ((ms ?? 0) < 1000) return `${Math.round(ms ?? 0)}ms`;

  const seconds = Math.round(ms / 1000);

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function heading(summary) {
  return [summary.project, summary.env].filter(Boolean).join(" · ");
}

function location(test) {
  return test.line ? `${test.file}:${test.line}` : test.file;
}

/* ------------------------------- Markdown ------------------------------- */

export function renderMarkdown(summary) {
  const { counts } = summary;
  const lines = [
    `### Playwright — ${heading(summary)}`,
    "",
    "| Total | ✅ Passed | ❌ Failed | ⚠️ Flaky | ⏭ Skipped | ⏱ Duration |",
    "| --- | --- | --- | --- | --- | --- |",
    `| ${counts.total} | ${counts.passed} | ${counts.failed} | ${counts.flaky} |` +
      ` ${counts.skipped} | ${formatDuration(summary.duration)} |`,
  ];

  const problems = summary.tests.filter(
    (test) => test.status === "failed" || test.status === "flaky",
  );

  if (problems.length) {
    lines.push("", `#### ${STATUS.failed.icon} Failed and flaky (${problems.length})`, "");

    for (const test of problems) {
      lines.push(`- ${STATUS[test.status].icon} **${test.title}** — \`${location(test)}\``);

      if (test.error) {
        lines.push("", "  ```", ...indentedError(test.error), "  ```", "");
      }
    }

    // Markdown cannot carry the inlined screenshots — GitHub blocks data: URIs
    // in the run summary — so point at the file that has them.
    if (problems.some((test) => test.screenshots?.length)) {
      lines.push(
        "",
        "Screenshots of these failures are in `summary.html` (the `summary-*` artifact).",
      );
    }
  }

  if (summary.run) {
    lines.push("", `[Open the run](${summary.run.url}) for the detailed report.`);
  }

  return `${lines.join("\n")}\n`;
}

function indentedError(error) {
  return error
    .slice(0, MD_ERROR_LIMIT)
    .split("\n")
    .slice(0, 12)
    .map((line) => `  ${line}`);
}

/* --------------------------------- HTML --------------------------------- */

export function renderHtml(summary) {
  const { counts } = summary;
  const problems = summary.tests.filter(
    (test) => test.status === "failed" || test.status === "flaky",
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Playwright summary — ${escapeHtml(heading(summary))}</title>
<style>
  :root {
    color-scheme: light;
    --plane: #f9f9f7;
    --surface: #fcfcfb;
    --ink: #0b0b0b;
    --ink-secondary: #52514e;
    --ink-muted: #898781;
    --hairline: #e1e0d9;
    --border: rgba(11, 11, 11, 0.1);
    --good: #0ca30c;
    --warning: #fab219;
    --critical: #d03b3b;
    --muted: #c3c2b7;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      color-scheme: dark;
      --plane: #0d0d0d;
      --surface: #1a1a19;
      --ink: #ffffff;
      --ink-secondary: #c3c2b7;
      --hairline: #2c2c2a;
      --border: rgba(255, 255, 255, 0.1);
      --muted: #383835;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px 20px 56px;
    background: var(--plane);
    color: var(--ink);
    font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  main { max-width: 960px; margin: 0 auto; display: grid; gap: 20px; }
  h1 { margin: 0; font-size: 20px; font-weight: 600; }
  h2 { margin: 0 0 12px; font-size: 15px; font-weight: 600; }
  .meta { margin: 4px 0 0; color: var(--ink-secondary); font-size: 13px; }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 18px;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
    gap: 12px;
  }
  .tile { display: grid; gap: 2px; }
  .tile .label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--ink-secondary);
    font-size: 12px;
  }
  .tile .value { font-size: 28px; font-weight: 600; line-height: 1.1; }
  .dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
  .dot.good { background: var(--good); }
  .dot.critical { background: var(--critical); }
  .dot.warning { background: var(--warning); }
  .dot.muted { background: var(--muted); }
  .meter { display: flex; gap: 2px; height: 10px; margin-top: 16px; }
  .meter span { border-radius: 4px; }
  .meter .good { background: var(--good); }
  .meter .critical { background: var(--critical); }
  .meter .warning { background: var(--warning); }
  .meter .muted { background: var(--muted); }
  .failure { padding: 14px 0; border-top: 1px solid var(--hairline); }
  .failure:first-of-type { border-top: 0; padding-top: 0; }
  .failure .title { font-weight: 600; }
  .failure .where {
    margin-top: 2px;
    color: var(--ink-muted);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  pre {
    margin: 10px 0 0;
    padding: 10px 12px;
    max-height: 260px;
    overflow: auto;
    background: var(--plane);
    border: 1px solid var(--hairline);
    border-radius: 8px;
    color: var(--ink-secondary);
    font: 12px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .shots {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 10px;
    margin-top: 12px;
  }
  .shots img {
    display: block;
    width: 100%;
    max-height: 320px;
    object-fit: cover;
    object-position: top;
    background: var(--plane);
    border: 1px solid var(--hairline);
    border-radius: 8px;
  }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 7px 8px; text-align: left; border-bottom: 1px solid var(--hairline); }
  th { color: var(--ink-muted); font-weight: 500; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .badge { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
  summary { cursor: pointer; font-weight: 600; }
  .empty { color: var(--ink-secondary); }
  footer { color: var(--ink-muted); font-size: 12px; text-align: center; }
  a { color: inherit; }
</style>
</head>
<body>
<main>
  <header>
    <h1>Playwright — ${escapeHtml(heading(summary))}</h1>
    <p class="meta">
      ${escapeHtml(new Date(summary.startedAt).toUTCString())} ·
      ${escapeHtml(formatDuration(summary.duration))}${
        summary.run
          ? ` · <a href="${escapeHtml(summary.run.url)}">run #${escapeHtml(summary.run.number ?? "")}</a>`
          : ""
      }
    </p>
  </header>

  <section class="card">
    <div class="tiles">
      ${tile("Total", counts.total)}
      ${tile(STATUS.passed.label, counts.passed, "good")}
      ${tile(STATUS.failed.label, counts.failed, "critical")}
      ${tile(STATUS.flaky.label, counts.flaky, "warning")}
      ${tile(STATUS.skipped.label, counts.skipped, "muted")}
    </div>
    ${meter(counts)}
  </section>

  <section class="card">
    <h2>${STATUS.failed.icon} Failed and flaky (${problems.length})</h2>
    ${
      problems.length
        ? problems.map(failure).join("\n")
        : '<p class="empty">Nothing to look at — every test passed on the first attempt.</p>'
    }
  </section>

  <section class="card">
    <details>
      <summary>All tests (${counts.total})</summary>
      <table>
        <thead>
          <tr><th>Status</th><th>Test</th><th class="num">Retries</th><th class="num">Duration</th></tr>
        </thead>
        <tbody>
          ${summary.tests.map(row).join("\n")}
        </tbody>
      </table>
    </details>
  </section>

  <footer>
    Short report — screenshots of the failures are above; videos and traces live in the
    detailed Playwright report.
  </footer>
</main>
</body>
</html>
`;
}

function tile(label, value, role) {
  const dot = role ? `<span class="dot ${role}"></span>` : "";

  return `<div class="tile">
        <div class="label">${dot}${escapeHtml(label)}</div>
        <div class="value">${value}</div>
      </div>`;
}

// Stacked pass/fail bar: proportions at a glance, counts already stated above.
function meter(counts) {
  const segments = [
    ["good", counts.passed],
    ["critical", counts.failed],
    ["warning", counts.flaky],
    ["muted", counts.skipped],
  ].filter(([, value]) => value > 0);

  if (!segments.length) return "";

  return `<div class="meter">
      ${segments
        .map(
          ([role, value]) =>
            `<span class="${role}" style="flex: ${value}" title="${value}"></span>`,
        )
        .join("\n      ")}
    </div>`;
}

function failure(test) {
  const status = STATUS[test.status];

  return `<div class="failure">
      <div class="title">${status.icon} ${escapeHtml(test.title)}</div>
      <div class="where">
        ${escapeHtml(location(test))} · ${escapeHtml(formatDuration(test.duration))}${
          test.retries ? ` · ${test.retries} retr${test.retries === 1 ? "y" : "ies"}` : ""
        }
      </div>
      ${test.error ? `<pre>${escapeHtml(test.error)}</pre>` : ""}
      ${screenshots(test)}
    </div>`;
}

// Screenshots of the failed attempt, inlined by the reporter. Each one links to
// itself so a click opens it full size in a new tab.
function screenshots(test) {
  if (!test.screenshots?.length) return "";

  return `<div class="shots">
        ${test.screenshots
          .map(
            (shot) =>
              `<a href="${shot.dataUri}" target="_blank" rel="noreferrer">` +
              `<img src="${shot.dataUri}" alt="${escapeHtml(shot.name)}" loading="lazy"></a>`,
          )
          .join("\n        ")}
      </div>`;
}

function row(test) {
  const status = STATUS[test.status];

  return `<tr>
            <td><span class="badge"><span class="dot ${status.role}"></span>${status.label}</span></td>
            <td>${escapeHtml(test.title)}</td>
            <td class="num">${test.retries || ""}</td>
            <td class="num">${escapeHtml(formatDuration(test.duration))}</td>
          </tr>`;
}
