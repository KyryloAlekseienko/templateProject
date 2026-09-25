import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { NETWORK_REQUESTS } from "../../constant/network-requests.constant";

export class BookTypesPage extends BasePage {
  private readonly checkoutBtn: Locator;
  private readonly bookTypes: Locator;
  private readonly cartContainer: Locator;
  private readonly checkoutNowLink: Locator;

  constructor(page: Page, endpoint: string = "") {
    super(page, endpoint);

    this.checkoutBtn = page.locator(".pb_suggested_action");
    this.bookTypes = page.locator('input[name^="book_types"]').first();
    this.cartContainer = page.locator("#pb_cart_container");
    this.checkoutNowLink = page.getByRole("link", { name: "Checkout now" });
  }

  private bookTypeInput(bookTypeId: string): Locator {
    return this.page.locator(`tr[book_type_id="${bookTypeId}"] input[name^="book_types"]`);
  }

  public async waitForBookTypesVisible() {
    console.log("BookTypesPage Wait For Book Types Visible");
    await expect(this.bookTypes).toBeVisible();
  }

  public async enterBookTypes(bookTypeId: string, numberOfSeats: number) {
    await this.fillInput(this.bookTypeInput(bookTypeId), String(numberOfSeats));
  }

  public async clickCheckoutButton() {
    await expect(this.checkoutBtn).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.seatsAddToCart.test(response.url()) &&
          response.request().method() === "POST" &&
          response.status() === 302,
        { timeout: 60_000 },
      ),
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartShow.test(response.url()) &&
          response.request().method() === "GET" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.click(this.checkoutBtn),
    ]);
  }

  public async waitCartContainer() {
    await expect(this.cartContainer).toBeVisible();
  }

  public async clickCheckoutNowButton() {
    await expect(this.checkoutNowLink).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartCheckout.test(response.url()) &&
          response.request().method() === "GET" &&
          response.status() === 302,
        { timeout: 60_000 },
      ),
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartContactDetails.test(response.url()) &&
          response.request().method() === "GET" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.click(this.checkoutNowLink),
    ]);
  }
}
