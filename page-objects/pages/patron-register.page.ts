import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AppRoutes } from "../../constant/endpoints.constant";
import { Patron } from "../data/patron.data";

export class PatronRegisterPage extends BasePage {
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly email2Input: Locator;
  private readonly passwordInput: Locator;
  private readonly password2Input: Locator;
  private readonly homePhoneInput: Locator;
  private readonly addressStreetInput: Locator;
  private readonly postcodeInput: Locator;
  private readonly countrySelect: Locator;
  private readonly registerBtn: Locator;
  private readonly errors: Locator;

  constructor(page: Page, endpoint: string = AppRoutes.patronRegister) {
    super(page, endpoint);

    this.firstNameInput = page.locator("#pb_first_name");
    this.lastNameInput = page.locator("#pb_last_name");
    this.emailInput = page.locator("#pb_email");
    this.email2Input = page.locator("#pb_email2");
    this.passwordInput = page.locator("#pb_password");
    this.password2Input = page.locator("#pb_password2");
    this.homePhoneInput = page.locator("#pb_home_phone");
    this.addressStreetInput = page.locator("#address_street");
    this.postcodeInput = page.locator("#address_postcode");
    this.countrySelect = page.locator("#address_country");
    this.registerBtn = page.locator("#submit_button");
    this.errors = page.locator("#errors");
  }

  public async enterBasicContactDetails(patron: Patron) {
    await this.fillInput(this.firstNameInput, patron.firstName);
    await this.fillInput(this.lastNameInput, patron.lastName);
    await this.emailInput.pressSequentially(patron.email);
  }

  public async enterSecondEmailAddress(email: string) {
    await this.fillInput(this.email2Input, email);
  }

  public async enterHomePhoneNumber(patron: Patron) {
    await this.fillInput(this.homePhoneInput, patron.homePhone);
  }

  public async enterAddressStreet(patron: Patron) {
    await this.fillInput(this.addressStreetInput, patron.addressStreet);
  }

  public async enterPostcode(postcode: string) {
    await this.fillInput(this.postcodeInput, postcode);
  }

  public async enterGender(gender: "M" | "F" | "O") {
    await this.click(this.page.locator(`#pb_gender_${gender}`));
  }

  public async enterCountry(country: string) {
    await this.countrySelect.selectOption({ label: country });
  }

  public async fillContactDetails(patron: Patron) {
    await this.enterBasicContactDetails(patron);
    await this.enterHomePhoneNumber(patron);
    await this.enterAddressStreet(patron);
    await this.enterCountry(patron.country);
  }

  public async fillPassword(password: string, confirmation: string = password) {
    await this.fillInput(this.passwordInput, password);
    await this.fillInput(this.password2Input, confirmation);
  }

  public async submit() {
    await this.click(this.registerBtn);
  }

  public async register(patron: Patron) {
    await this.fillContactDetails(patron);
    await this.fillPassword(patron.password);
    await this.submit();
  }

  public async expectSuccessMessage() {
    await expect(this.page.getByText(/Congratulations, you are now registered/)).toBeVisible();
  }

  public async expectErrorMessage(message: string | RegExp) {
    await this.errors.waitFor({ state: "visible" });
    await expect(this.errors).toContainText(message);
  }
}
