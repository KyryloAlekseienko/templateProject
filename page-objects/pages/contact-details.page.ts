import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { Patron } from "../data/patron.data";
import { NETWORK_REQUESTS } from "../../constant/network-requests.constant";

export class ContactDetailsPage extends BasePage {
  private readonly loginOption: Locator;
  private readonly createOption: Locator;
  private readonly basicEmailInput: Locator;
  private readonly basicFirstNameInput: Locator;
  private readonly basicLastNameInput: Locator;
  private readonly nextBtn: Locator;
  private readonly homePhoneInput: Locator;
  private readonly passwordInput: Locator;
  private readonly password2Input: Locator;
  private readonly addressStreetInput: Locator;
  private readonly addressTownInput: Locator;
  private readonly addressPostcodeInput: Locator;
  private readonly countrySelect: Locator;
  private readonly continueBtn: Locator;

  constructor(page: Page, endpoint: string = "") {
    super(page, endpoint);

    this.loginOption = page.locator("#new_existing_LOGIN");
    this.createOption = page.locator("#new_existing_CREATE");
    this.basicEmailInput = page.locator("#pb_basic-details__email");
    this.basicFirstNameInput = page.locator("#pb_basic-details__first_name");
    this.basicLastNameInput = page.locator("#pb_basic-details__last_name");
    this.nextBtn = page.locator("input.pb-next-registration-step");
    this.homePhoneInput = page.locator("#home_phone");
    this.passwordInput = page.locator("#password");
    this.password2Input = page.locator("#password2");
    this.addressStreetInput = page.locator("#address_street");
    this.addressTownInput = page.locator("#address_town");
    this.addressPostcodeInput = page.locator("#address_postcode");
    this.countrySelect = page.locator("#address_country");
    this.continueBtn = page.locator("span.pb_register_patron");
  }

  public async waitForCreateOptionVisible() {
    console.log("ContactDetailsPage Wait For Create Option Visible");
    await expect(this.createOption).toBeVisible();
  }

  public async chooseGuestOption() {
    await expect(this.createOption).toBeVisible();
    await this.click(this.createOption);
    await this.waitForTimeout();
  }

  public async chooseLoginOption() {
    await expect(this.loginOption).toBeVisible();
    await this.click(this.loginOption);
    await this.waitForTimeout();
  }

  public async enterBasicDetails(patron: Patron) {
    try {
      await expect(this.basicEmailInput).toBeVisible();
      await expect(this.basicFirstNameInput).toBeVisible();
      await expect(this.basicLastNameInput).toBeVisible();
    } catch {
      await this.chooseGuestOption();
    }
    await this.fillInput(this.basicEmailInput, patron.email);
    await this.fillInput(this.basicFirstNameInput, patron.firstName);
    await this.fillInput(this.basicLastNameInput, patron.lastName);
  }

  public async clickNextButton() {
    await expect(this.nextBtn).toBeVisible();
    await this.click(this.nextBtn);
    await this.waitForTimeout();
  }

  public async enterFullDetails(patron: Patron) {
    await this.fillInput(this.homePhoneInput, patron.homePhone);
    await this.fillInput(this.passwordInput, patron.password);
    await this.fillInput(this.password2Input, patron.password);
    await this.fillInput(this.addressStreetInput, patron.addressStreet);
    await this.fillInput(this.addressTownInput, patron.town);
    await this.fillInput(this.addressPostcodeInput, patron.postcode);
    await this.countrySelect.selectOption({ label: patron.country });
  }

  public async clickContinueButton() {
    await expect(this.continueBtn).toBeVisible();
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
          NETWORK_REQUESTS.cartAddBookingProtect.test(response.url()) &&
          response.request().method() === "GET" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.click(this.continueBtn),
    ]);
  }

  public async registerAsGuest(patron: Patron) {
    await this.chooseGuestOption();
    await this.enterBasicDetails(patron);
    await this.clickNextButton();
    await this.enterFullDetails(patron);
    await this.clickContinueButton();
  }
}
