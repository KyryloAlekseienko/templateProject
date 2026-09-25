// import { Locator, Page } from "@playwright/test";
// import { BasePage } from "./base.page";
// import { AppRoutes } from "../../constant/endpoints.constant";
// import {VisualAssertions} from "../../lib/visual/utils/visual-assertions.utils";
// import {ScreenshotConfigs} from "../../constant/screenshot.constant";
//
// export class LoginPage extends BasePage {
//   private readonly loginInput: Locator;
//   private readonly passwordInput: Locator;
//   private readonly loginBtn: Locator;
//
//   private readonly visual: VisualAssertions;
//
//   constructor(page: Page, endpoint: string = AppRoutes.loginPage) {
//     super(page, endpoint);
//
//     this.loginInput = page.locator("#wpName1");
//     this.passwordInput = page.locator("#wpPassword1");
//     this.loginBtn = page.locator("#wpLoginAttempt");
//
//     this.visual = new VisualAssertions(this.page);
//   }
//
//   public async login(email: string, password: string) {
//     await this.fillInput(this.loginInput, email);
//     await this.fillInput(this.passwordInput, password);
//     await this.click(this.loginBtn);
//   }
//
//   public async expectScreenshot(): Promise<void> {
//     await this.visual.expectPageScreenshot(ScreenshotConfigs.LoginPage.Default.name);
//
//     // await this.visual.expectElementScreenshot(this.loginInput, ScreenshotConfigs.LoginPage.Locators.name);
//     //
//     // const dynamicElements = [
//     //   this.loginInput,
//     //   this.passwordInput,
//     //   this.loginBtn
//     // ];
//     //
//     // await this.visual.expectPageScreenshot(ScreenshotConfigs.LoginPage.Mask.name,
//     //     {
//     //       mask: dynamicElements,
//     //       maxDiffPixelRatio: 0.1,
//     //     }
//     // );
//   }
// }
