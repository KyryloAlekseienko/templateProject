import { test as base } from "@playwright/test";
import { ZzDemoProductionsPage } from "../../page-objects/pages/zzdemo-productions.page";

type Pages = {
  zzDemoProductionsPage: ZzDemoProductionsPage;
  //TODO
};

type Helpers = {
  //webControlPanel: WebControlPanelHelper;
  //TODO
};

type Visual = {
  page: any;
};

export const pageManagerFixture = base.extend<Pages & Helpers & Visual>({
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

    await page.route("**/analytics/**", (r) => r.abort());
    await page.route("**/metrics/**", (r) => r.abort());
    await page.route("**/ads/**", (r) => r.abort());

    await use(page);
  },
});

export { expect } from "@playwright/test";
