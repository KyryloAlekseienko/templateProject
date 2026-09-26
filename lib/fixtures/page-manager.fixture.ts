import { BrowserContext, Page, test as base } from "@playwright/test";
import { ZzDemoProductionsPage } from "../../page-objects/pages/zzdemo-productions.page";

type Pages = {
  zzDemoProductionsPage: ZzDemoProductionsPage;
  //TODO
};

type Helpers = {
  //webControlPanel: WebControlPanelHelper;
  //TODO
};

export const pageManagerFixture = base.extend<Pages & Helpers>({
  // Page Objects
  zzDemoProductionsPage: async ({ page }, use) => {
    await use(new ZzDemoProductionsPage(page));
  },
  //TODO

  // Helpers
  // webControlPanel: async ({ page }, use) => {
  //   await use(new WebControlPanelHelper(page));
  // },
  //TODO

  // Visual layer
  page: async ({ page }, use) => {
    // await page.addInitScript(() => {
    //   Date.now = () => 1700000000000;
    //   performance.now = () => 1000;
    // });

    await blockNoise(page);

    await use(page);
  },
});

export async function blockNoise(target: Page | BrowserContext) {
  await target.route("**/analytics/**", (r) => r.abort());
  await target.route("**/metrics/**", (r) => r.abort());
  await target.route("**/ads/**", (r) => r.abort());
}

export { expect } from "@playwright/test";
