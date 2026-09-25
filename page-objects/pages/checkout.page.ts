import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AppRoutes } from "../../constant/endpoints.constant";
import { NETWORK_REQUESTS } from "../../constant/network-requests.constant";

export class CheckoutPage extends BasePage {
  private readonly cardTypeSelect: Locator;
  private readonly cardNumberInput: Locator;
  private readonly nameOnCardInput: Locator;
  private readonly cardExpiryMonthSelect: Locator;
  private readonly cardExpiryYearSelect: Locator;
  private readonly cardCscInput: Locator;
  private readonly termsAndConditionsCheckbox: Locator;
  private readonly completeSaleBtn: Locator;
  private readonly errorBlock: Locator;

  constructor(page: Page, endpoint: string = AppRoutes.checkout) {
    super(page, endpoint);

    this.cardTypeSelect = page.locator("#cc_type");
    this.cardNumberInput = page.locator("#cc_number");
    this.nameOnCardInput = page.locator("#cc_name_on_card");
    this.cardExpiryMonthSelect = page.locator("#cc_exp_month");
    this.cardExpiryYearSelect = page.locator("#cc_exp_year");
    this.cardCscInput = page.locator("#cc_cvv2");
    this.termsAndConditionsCheckbox = page.locator("#agree");
    this.completeSaleBtn = page.locator('input[value="Complete Sale"]');
    this.errorBlock = page.locator(".error_block");
  }

  public async enterCreditCardType(type: string) {
    await expect(this.cardTypeSelect).toBeVisible();
    await this.cardTypeSelect.selectOption(type);
  }

  public async enterCreditCardNumber(ccNumber: string) {
    await expect(this.cardNumberInput).toBeVisible();
    await this.fillInput(this.cardNumberInput, ccNumber);
  }

  public async enterNameOnCard(name: string = "Test Patron") {
    await expect(this.nameOnCardInput).toBeVisible();
    await this.fillInput(this.nameOnCardInput, name);
  }

  public async enterExpiryDate(month?: string, year?: string) {
    const now = new Date();
    const resolvedMonth = (month ?? String(now.getMonth() + 1)).padStart(
      2,
      "0",
    );
    const resolvedYear = year ?? String(now.getFullYear() + 1);

    await this.cardExpiryMonthSelect.selectOption(resolvedMonth);
    await this.cardExpiryYearSelect.selectOption(resolvedYear);
  }

  public async enterCSC(csc: string = "123") {
    await expect(this.cardCscInput).toBeVisible();
    await this.fillInput(this.cardCscInput, csc);
  }

  public async agreeToTermsAndConditions() {
    await expect(this.termsAndConditionsCheckbox).toBeVisible();
    await this.termsAndConditionsCheckbox.check();
  }

  public async clickCompleteSaleButton() {
    await expect(this.completeSaleBtn).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartCheckout.test(response.url()) &&
          response.request().method() === "POST" &&
          response.status() === 302,
        { timeout: 60_000 },
      ),
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartTest3PartyRedirect.test(response.url()) &&
          response.request().method() === "GET" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartTest3PartyExternalPage.test(response.url()) &&
          response.request().method() === "POST" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.click(this.completeSaleBtn.first()),
    ]);
  }

  public async clickCompleteSaleButtonInline() {
    await expect(this.completeSaleBtn).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.cartCheckout.test(response.url()) &&
          response.request().method() === "POST" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.click(this.completeSaleBtn.first()),
    ]);
  }

  public async expectNoErrorMessages() {
    await expect(
      this.page.locator("#cc_errors, #cc_error, .error_block"),
    ).toHaveCount(0);
  }

  public async expectSaleConfirmation(
    text: string | RegExp = "Thanks for booking tickets with",
  ) {
    await expect(this.page.getByText(text)).toBeVisible({ timeout: 60_000 });
  }

  public async expectErrorMessage(text: string | RegExp) {
    await expect(this.errorBlock).toContainText(text, { timeout: 60_000 });
  }
}
