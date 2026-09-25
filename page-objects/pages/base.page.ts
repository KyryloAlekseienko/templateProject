import { expect, Locator, Page } from "@playwright/test";
import { BaseEntity } from "../base.entity";
import { testConfig } from "../../configs/config";

export abstract class BasePage extends BaseEntity {
  protected endpoint: string;

  protected constructor(page: Page, endpoint: string) {
    super(page);
    this.endpoint = endpoint;
  }

  async open(path: string = this.endpoint) {
    console.log(`open ${testConfig.baseUrl}${path}`);
    await this.page.goto(`${testConfig.baseUrl}${path}`, {
      waitUntil: "networkidle",
    });
  }

  async shouldHaveUrl(path: string) {
    await expect(this.page).toHaveURL(`${testConfig.baseUrl}${path}`);
  }

  async waitNetworkKidLoadState() {
    await this.page.waitForLoadState("networkidle");
  }

  async waitForDomContentLoad() {
    await this.page.waitForLoadState("domcontentloaded");
  }

  async waitForLoadState() {
    await this.page.waitForLoadState(`load`);
  }

  async reloadPage() {
    await this.page.reload();
    await this.waitForDomContentLoad();
  }

  async click(locator: Locator) {
    await locator.waitFor({ state: "visible" });
    await locator.hover();
    await locator.click();
  }

  async clearInput(field: Locator) {
    await field.waitFor({ state: "visible" });
    await field.clear();
  }

  async fillInput(field: Locator, value: string) {
    await field.waitFor({ state: "visible" });
    await this.clearInput(field);
    await field.fill(value);
  }

  async expectText(locator: Locator, expectedText: string | RegExp, name?: string) {
    const label = name ?? "Locator";

    await expect(locator, `${label} should have text "${expectedText}"`).toHaveText(expectedText);
  }

  async expectAllVisible(locators: Locator[], name = "Locator list") {
    const failed: string[] = [];

    for (let i = 0; i < locators.length; i++) {
      const locator = locators[i];

      try {
        await expect(locator).toBeVisible();
      } catch {
        failed.push(`${name}[${i}]`);
      }
    }

    if (failed.length > 0) {
      throw new Error(`Some locators are not visible:\n` + failed.map((f) => ` - ${f}`).join("\n"));
    }
  }
}
