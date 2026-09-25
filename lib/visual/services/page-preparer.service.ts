import { Page } from "@playwright/test";

export class PagePreparer {
  private prepared = false;

  constructor(private readonly page: Page) {}

  async prepare(): Promise<void> {
    if (this.prepared) return;

    await this.page.waitForLoadState("networkidle");
    await this.page.waitForFunction(() => document.fonts.ready);
    await this.page.addStyleTag({
      path: "lib/visual/styles/hide-dynamic.css",
    });

    // await applyVisualMocks(this.page);

    this.prepared = true;
  }

  reset(): void {
    this.prepared = false;
  }
}
