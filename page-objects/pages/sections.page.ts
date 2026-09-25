import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { NETWORK_REQUESTS } from "../../constant/network-requests.constant";

export class SectionsPage extends BasePage {
  private readonly selectSectionText: Locator;
  private readonly proceedLink: Locator;

  constructor(page: Page, endpoint: string = "") {
    super(page, endpoint);

    this.selectSectionText = page.getByText("Please select a section from the list below:");
    this.proceedLink = page
      .getByRole("link", { name: "Continue" })
      .or(page.getByRole("link", { name: "Choose seats for me" }));
  }

  public async waitForSelectSectionTextVisible() {
    console.log("SectionsPage Wait For Select SectionText Visible");
    await expect(this.selectSectionText).toBeVisible();
  }

  public async chooseSeatType(sectionId: string, seatTypeId: string) {
    const radio = this.page.locator(
      `#section_id_${sectionId.toLowerCase()}_seat_type_id_${seatTypeId.toLowerCase()}`,
    );
    await expect(radio).toBeVisible();
    await radio.check();
  }

  public async chooseAvailableSeatType(): Promise<string> {
    const radio = this.page
      .locator('input[type="radio"][name="seat_type_id"]:not([disabled])')
      .first();
    await expect(radio).toBeVisible();
    const seatTypeId = await radio.getAttribute("value");
    await radio.check();
    return seatTypeId!;
  }

  public async clickContinueButton() {
    await expect(this.proceedLink).toBeVisible();
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          NETWORK_REQUESTS.seatsNumSeats.test(response.url()) &&
          response.request().method() === "GET" &&
          response.status() === 200,
        { timeout: 60_000 },
      ),
      this.click(this.proceedLink.first()),
    ]);
  }
}
