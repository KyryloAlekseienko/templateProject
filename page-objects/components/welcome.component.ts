import { expect, Locator, Page } from "@playwright/test";
import { BaseComponent } from "../base/base.component";

export class WelcomeComponent extends BaseComponent {
  private readonly welcomeMessage: Locator;
  private readonly signOutBtn: Locator;

  constructor(page: Page, root: string | Locator = "#pb_welcome") {
    super(page, root);

    this.welcomeMessage = this.within(".stuff .p").first();
    this.signOutBtn = this.within(".bottom a");
  }

  public async expectWelcomeMessage(patronName: string) {
    await this.welcomeMessage.waitFor({ state: "visible" });
    await expect(this.welcomeMessage).toContainText(`Welcome back ${patronName}.`);
  }

  public async signOut() {
    await this.signOutBtn.waitFor({ state: "visible" });
    await this.signOutBtn.click();
  }
}
