import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AppRoutes } from "../../constant/endpoints.constant";

export class CompleteSalePage extends BasePage {
  private readonly saleReceiptTitle: Locator;
  private readonly printHomeTicketsButton: Locator;

  constructor(page: Page, endpoint: string = "") {
    super(page, endpoint);

    this.saleReceiptTitle = page.locator("#pb_page_title");
    this.printHomeTicketsButton = page.getByRole("button", {
      name: "Print at Home tickets",
    });
  }

  public init(saleId: string) {
    this.endpoint = AppRoutes.test3PartyCompleteSalePage(saleId);
    return this;
  }

  public async waitForSaleReceiptTitleVisible() {
    console.log("CompleteSalePage Wait For Sale Receipt Title Visible");
    await expect(this.saleReceiptTitle).toBeVisible();
  }
}
