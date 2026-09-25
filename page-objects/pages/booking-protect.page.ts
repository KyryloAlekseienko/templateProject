import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { NETWORK_REQUESTS } from "../../constant/network-requests.constant";

export class BookingProtectPage extends BasePage {
  private readonly heading: Locator;
  private readonly declineBtn: Locator;
  private readonly acceptBtn: Locator;

  constructor(page: Page, endpoint: string = "") {
    super(page, endpoint);

    this.heading = page.getByRole("heading", {
      name: "Make your tickets refundable",
    });
    this.declineBtn = page.getByText("No thanks", { exact: true });
    this.acceptBtn = page.getByText("Yes please", { exact: true });
  }

  public async waitForHeadingVisible() {
    console.log("BookingProtectPage Wait For Heading Visible");
    await expect(this.heading).toBeVisible();
  }

  public async declineProtection() {
    await expect(this.declineBtn).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartAddBookingProtect.test(response.url()) &&
          response.request().method() === "POST" &&
          response.status() === 302,
        { timeout: 60_000 },
      ),
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartCheckout.test(response.url()) &&
          response.request().method() === "GET" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.click(this.declineBtn),
    ]);
  }

  public async acceptProtection() {
    await expect(this.acceptBtn).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartAddBookingProtect.test(response.url()) &&
          response.request().method() === "POST" &&
          response.status() === 302,
        { timeout: 60_000 },
      ),
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartCheckout.test(response.url()) &&
          response.request().method() === "GET" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.click(this.acceptBtn),
    ]);
  }
}
