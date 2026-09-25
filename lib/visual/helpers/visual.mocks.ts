import { Page } from "@playwright/test";

export async function applyVisualMocks(page: Page) {
  // optional: mock unstable APIs
  await page.route("**/user/session", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        user: { name: "test-user", role: "qa" },
      }),
    }),
  );
}
