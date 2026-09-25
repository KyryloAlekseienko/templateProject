import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AppRoutes } from "../../constant/endpoints.constant";
import { NETWORK_REQUESTS } from "../../constant/network-requests.constant";

export class PerformancesPage extends BasePage {
  private readonly chooseSeatsForMeBtn: Locator;
  private readonly chooseMyOwnSeatsBtn: Locator;
  private readonly selectPerformance: Locator;

  constructor(page: Page, endpoint: string = "") {
    super(page, endpoint);

    this.chooseSeatsForMeBtn = page.getByRole("button", {
      name: "Choose seats for me",
    });
    this.chooseMyOwnSeatsBtn = page.getByRole("button", {
      name: "Let me choose my seats",
    });
    this.selectPerformance = page.getByText("Select a performance to book tickets for");
  }

  public init(prodId: string) {
    this.endpoint = AppRoutes.performances(prodId);
    return this;
  }

  public async waitForSelectPerformanceVisible() {
    console.log("PerformancesPage Wait For Select Performance Visible");
    await expect(this.selectPerformance).toBeVisible();
  }

  public async chooseSeatsForMe() {
    await expect(this.chooseSeatsForMeBtn).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.sectionsChoose.test(response.url()) &&
          response.request().method() === "GET" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.click(this.chooseSeatsForMeBtn),
    ]);
  }

  public async chooseMyOwnSeats() {
    await expect(this.chooseMyOwnSeatsBtn).toBeVisible();
    await this.click(this.chooseMyOwnSeatsBtn);
  }
}
