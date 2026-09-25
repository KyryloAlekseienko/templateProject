import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AppRoutes } from "../../constant/endpoints.constant";
import { NETWORK_REQUESTS } from "../../constant/network-requests.constant";

export class TestThreePartyPage extends BasePage {
  private readonly simulateOkBtn: Locator;
  private readonly simulateSlowOkBtn: Locator;
  private readonly simulateDeclineBtn: Locator;
  private readonly cancelBtn: Locator;
  private readonly disabledBtn: Locator;

  constructor(page: Page, endpoint: string = "") {
    super(page, endpoint);

    this.simulateOkBtn = page.getByRole("button", {
      name: "Simulate OK Transaction",
      exact: true,
    });
    this.simulateSlowOkBtn = page.getByRole("button", {
      name: "Simulate OK Transaction (but slowly)",
    });
    this.simulateDeclineBtn = page.getByRole("button", {
      name: "Simulate Decline",
    });
    this.cancelBtn = page.getByRole("button", { name: "Cancel", exact: true });
    this.disabledBtn = page.getByRole("button", { name: "I am disabled..." });
  }

  public init(saleId: string): this {
    this.endpoint = AppRoutes.test3PartyExternalPage(saleId);
    return this;
  }

  getTest3PartySaleId(): string {
    const currentUrl = this.page.url();
    const saleId = new URL(currentUrl).searchParams.get("sale_id");

    if (!saleId) {
      throw new Error(`sale_id was not found in URL: ${currentUrl}`);
    }

    return saleId;
  }

  public async waitForSimulateOkBtnVisible() {
    console.log("TestThreePartyPage Wait For Simulate Ok Btn Visible");
    await expect(this.simulateOkBtn).toBeVisible();
  }

  public async clickSimulateOk() {
    await expect(this.simulateOkBtn).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartTest3PartyReturn.test(response.url()) &&
          response.request().method() === "POST" &&
          response.status() === 200,
        { timeout: 30000 },
      ),
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartTest3PartyCompleteSale.test(response.url()) &&
          response.request().method() === "POST" &&
          response.status() === 200,
        { timeout: 30000 },
      ),
      this.click(this.simulateOkBtn),
    ]);
  }

  public async clickSimulateSlowOk() {
    await expect(this.simulateSlowOkBtn).toBeVisible();
    await this.click(this.simulateSlowOkBtn);
  }

  public async clickSimulateDecline() {
    await expect(this.simulateDeclineBtn).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartTest3PartyReturn.test(response.url()) &&
          response.request().method() === "POST" &&
          response.status() === 200,
        { timeout: 30000 },
      ),
      this.click(this.simulateDeclineBtn),
    ]);
  }

  public async clickCancel() {
    await expect(this.cancelBtn).toBeVisible();
    await this.click(this.cancelBtn);
  }
}
