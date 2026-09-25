import { Locator, Page } from "@playwright/test";
import { BasePage } from "../base.page";
import { AppRoutes } from "../../../constant/endpoints.constant";
import { generateTotpCode } from "../../../lib/core/utils/totp";

export class HqLoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInBtn: Locator;

  private readonly tokenInput: Locator;
  private readonly validateBtn: Locator;

  constructor(page: Page, endpoint: string = AppRoutes.adminHQLogin) {
    super(page, endpoint);

    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.signInBtn = page.locator('input[type="submit"][value="Sign in"]');

    this.tokenInput = page.locator('input[name="token"]');
    this.validateBtn = page.locator('input[type="submit"][value="Validate"]');
  }

  public async login(username: string, password: string) {
    await this.open();
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.click(this.signInBtn);
  }

  public async submitTotpToken(totpSecret: string) {
    await this.tokenInput.waitFor({ state: "visible" });
    await this.fillInput(this.tokenInput, await generateTotpCode(totpSecret));
    await this.click(this.validateBtn);
  }

  public async loginWithTotp(
    username: string,
    password: string,
    totpSecret: string,
  ) {
    await this.login(username, password);
    await this.submitTotpToken(totpSecret);
  }
}
