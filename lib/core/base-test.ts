import { test as base } from "@playwright/test";
import { ZzDemoProductionsPage } from "../../page-objects/pages/zzdemo-productions.page";
import { PatronRegisterPage } from "../../page-objects/pages/patron-register.page";
import { PerformancesPage } from "../../page-objects/pages/performances.page";
import { SectionsPage } from "../../page-objects/pages/sections.page";
import { SeatsPage } from "../../page-objects/pages/seats.page";
import { BookTypesPage } from "../../page-objects/pages/book-types.page";
import { ContactDetailsPage } from "../../page-objects/pages/contact-details.page";
import { BookingProtectPage } from "../../page-objects/pages/booking-protect.page";
import { CheckoutPage } from "../../page-objects/pages/checkout.page";
import { WebControlPanelHelper } from "./helpers/web-control-panel.helper";
import { TestThreePartyPage } from "../../page-objects/pages/test3party.page";
import { CompleteSalePage } from "../../page-objects/pages/complete-sale.page";

type Pages = {
  zzDemoProductionsPage: ZzDemoProductionsPage;
  patronRegisterPage: PatronRegisterPage;
  performancesPage: PerformancesPage;
  sectionsPage: SectionsPage;
  seatsPage: SeatsPage;
  bookTypesPage: BookTypesPage;
  contactDetailsPage: ContactDetailsPage;
  bookingProtectPage: BookingProtectPage;
  checkoutPage: CheckoutPage;
  testThreePartyPage: TestThreePartyPage;
  completeSalePage: CompleteSalePage;
};

type Helpers = {
  webControlPanel: WebControlPanelHelper;
};

type Visual = {
  page: any;
};

export const test = base.extend<Pages & Helpers & Visual>({
  // Page Objects

  zzDemoProductionsPage: async ({ page }, use) => {
    await use(new ZzDemoProductionsPage(page));
  },

  patronRegisterPage: async ({ page }, use) => {
    await use(new PatronRegisterPage(page));
  },

  performancesPage: async ({ page }, use) => {
    await use(new PerformancesPage(page));
  },

  sectionsPage: async ({ page }, use) => {
    await use(new SectionsPage(page));
  },

  seatsPage: async ({ page }, use) => {
    await use(new SeatsPage(page));
  },

  bookTypesPage: async ({ page }, use) => {
    await use(new BookTypesPage(page));
  },

  contactDetailsPage: async ({ page }, use) => {
    await use(new ContactDetailsPage(page));
  },

  bookingProtectPage: async ({ page }, use) => {
    await use(new BookingProtectPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  testThreePartyPage: async ({ page }, use) => {
    await use(new TestThreePartyPage(page));
  },

  completeSalePage: async ({ page }, use) => {
    await use(new CompleteSalePage(page));
  },

  // Helpers
  webControlPanel: async ({ page }, use) => {
    await use(new WebControlPanelHelper(page));
  },

  // Visual layer
  page: async ({ page }, use) => {
    // await page.addInitScript(() => {
    //   Date.now = () => 1700000000000;
    //   performance.now = () => 1000;
    // });

    await page.route("**/analytics/**", (r) => r.abort());
    await page.route("**/metrics/**", (r) => r.abort());
    await page.route("**/ads/**", (r) => r.abort());

    await use(page);
  },
});

export { expect } from "@playwright/test";
