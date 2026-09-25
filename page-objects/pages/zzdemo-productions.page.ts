import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { LoginComponent } from "../components/login.component";
import { AppRoutes } from "../../constant/endpoints.constant";
import { WelcomeComponent } from "../components/welcome.component";

export class ZzDemoProductionsPage extends BasePage {
  public readonly login: LoginComponent;
  public readonly welcomeComponent: WelcomeComponent;

  constructor(page: Page, endpoint: string = AppRoutes.productions) {
    super(page, endpoint);

    this.login = new LoginComponent(page);
    this.welcomeComponent = new WelcomeComponent(page);
  }

  public async clickProduction(prodId: string) {
    const production = this.page.locator(`#pb_productions .pb_event_title a[href*="${prodId}"]`);
    await expect(production).toBeVisible();
    await this.click(production);
  }
}
