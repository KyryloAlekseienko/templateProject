import { Page } from "@playwright/test";

export abstract class BaseEntity {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  async waitForTimeout(timeout = 5000) {
    await this.page.waitForTimeout(timeout);
  }
}
