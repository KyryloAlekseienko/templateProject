import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { NETWORK_REQUESTS } from "../../constant/network-requests.constant";

export class SeatsPage extends BasePage {
  private readonly numberOfSeatsInput: Locator;
  private readonly continueBtn: Locator;
  private readonly confirmSeatsOnHoldBtn: Locator;
  private readonly chooseSeatsForMeButton: Locator;
  private readonly letMeChooseMySeatsButton: Locator;

  constructor(page: Page, endpoint: string = "") {
    super(page, endpoint);

    this.numberOfSeatsInput = page.locator("#num_seats");
    this.continueBtn = page.locator(".pb_suggested_action");
    this.confirmSeatsOnHoldBtn = page.locator('input[type="submit"][name="yes"]');
    this.chooseSeatsForMeButton = page.getByText("Choose seats for me");
    this.letMeChooseMySeatsButton = page.getByText("Let me choose my seats");
  }

  public async waitForNumberOfSeatsInputVisible() {
    console.log("SeatsPage Wait For Number Of Seats Input Visible");
    await expect(this.numberOfSeatsInput).toBeVisible();
  }

  public async selectNumberOfSeats(seats: number) {
    await expect(this.numberOfSeatsInput).toBeVisible();
    await this.numberOfSeatsInput.selectOption(String(seats));
  }

  public async clickContinueButton() {
    await expect(this.continueBtn).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.seatsConfirm.test(response.url()) &&
          response.request().method() === "GET" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.click(this.continueBtn.first()),
    ]);
  }

  public async waitForConfirmSeatsOnHoldBtnVisible() {
    console.log("SeatsPage Wait For Confirm Seats On Hold Btn Visible");
    await this.confirmSeatsOnHoldBtn.waitFor({ state: "visible" });
  }

  public async clickConfirmButton() {
    await expect(this.confirmSeatsOnHoldBtn).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.seatsBookTypes.test(response.url()) &&
          response.request().method() === "POST" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.click(this.confirmSeatsOnHoldBtn.first()),
    ]);
  }

  public async chooseSeatsForMe() {
    await expect(this.chooseSeatsForMeButton).toBeVisible();
    await this.click(this.chooseSeatsForMeButton);
  }

  public async chooseMyOwnSeats() {
    await expect(this.letMeChooseMySeatsButton).toBeVisible();
    await this.click(this.letMeChooseMySeatsButton);
  }
}
