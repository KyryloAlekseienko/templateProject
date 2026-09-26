import { BaseComponent } from "../base/base.component";
import { expect, Locator, Page } from "@playwright/test";

export class HeaderComponent extends BaseComponent {
  private readonly userName: Locator;

  constructor(page: Page, root: string | Locator = ".mw-header") {
    super(page, root);

    this.userName = this.within("#pt-userpage-2 span");
  }

  public async verifyUserName(expectedName: string) {
    await expect(this.userName).toHaveText(expectedName);
  }
}
