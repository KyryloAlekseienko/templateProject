import { expect, Locator, Page } from "@playwright/test";
import {
  VisualSnapshotConfig,
  VisualSnapshotOptions,
} from "../config/visual-snapshot.config";
import { PagePreparer } from "../services/page-preparer.service";

export class VisualAssertions {
  private readonly preparer: PagePreparer;
  private readonly defaultConfig = VisualSnapshotConfig.defaults();

  constructor(private readonly page: Page) {
    this.preparer = new PagePreparer(page);
  }

  async expectPageScreenshot(
    name: string | string[],
    options: VisualSnapshotOptions = {},
  ): Promise<void> {
    await this.preparer.prepare();
    const config = this.defaultConfig.withOverrides(options);
    await expect(this.page).toHaveScreenshot(
      name,
      config.toPlaywrightOptions(),
    );
  }

  async expectElementScreenshot(
    locator: Locator,
    name: string | string[],
    options: VisualSnapshotOptions = {},
  ): Promise<void> {
    await this.preparer.prepare();
    await locator.scrollIntoViewIfNeeded();
    const config = this.defaultConfig.withOverrides(options);
    await expect(locator).toHaveScreenshot(name, config.toPlaywrightOptions());
  }

  async expectScreenshot(
    target: Page | Locator,
    name: string | string[],
    options: VisualSnapshotOptions = {},
  ): Promise<void> {
    if (target === this.page) {
      return this.expectPageScreenshot(name, options);
    }
    return this.expectElementScreenshot(target as Locator, name, options);
  }

  resetPreparation(): void {
    this.preparer.reset();
  }
}
