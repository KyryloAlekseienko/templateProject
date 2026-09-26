import { expect, Locator, Page } from "@playwright/test";
import { BaseComponent } from "../base/base.component";

export class LoginComponent extends BaseComponent {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInBtn: Locator;
  private readonly errorDialog: Locator;

  constructor(page: Page, root: string | Locator = "#pb-sidebar-login__block") {
    super(page, root);

    this.emailInput = this.within("#login_email");
    this.passwordInput = this.within("#login_password");
    this.signInBtn = this.within('[data-id="login"]');

    this.errorDialog = page.locator("#pb_alert_dialog");
  }

  public async login(email: string, password: string) {
    await this.emailInput.waitFor({ state: "visible" });
    await this.emailInput.fill(email);

    await this.passwordInput.waitFor({ state: "visible" });
    await this.passwordInput.fill(password);

    await this.signInBtn.waitFor({ state: "visible" });
    await this.signInBtn.click();
  }

  public async expectLoginError(message: string | RegExp) {
    await this.errorDialog.waitFor({ state: "visible" });
    await expect(this.errorDialog).toContainText(message);
  }
}
