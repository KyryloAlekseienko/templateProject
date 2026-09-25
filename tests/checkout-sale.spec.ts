import { Page } from "@playwright/test";
import { Tag } from "../constant/test-tags.constant";
import { test } from "../lib/core/base-test";
import { ProductionIds } from "../constant/productions.constant";
import { createPatron } from "../page-objects/data/patron.data";
import { ErrorMessages } from "../constant/error-messages.constant";
import { WebControlPanelHelper } from "../lib/core/helpers/web-control-panel.helper";
import { SkinsIds } from "../constant/skins.constant";
import { LicenseCheckboxIds } from "../constant/licensing.constant";
import { TestCard } from "../constant/test-card.constant";

test.describe(`Checkout - ticket sale`, () => {
  test.describe.configure({ mode: "serial" });

  let setupPage: Page;
  let originalLicensing: Record<string, boolean> = {};

  test.beforeAll(async ({ browser }) => {
    setupPage = await browser.newPage();
    const webControlPanel = new WebControlPanelHelper(setupPage);

    originalLicensing = await webControlPanel.getLicensing(SkinsIds.ZZDemo, [
      LicenseCheckboxIds.booking_protect,
    ]);
    await webControlPanel.setLicensing(SkinsIds.ZZDemo, {
      [LicenseCheckboxIds.booking_protect]: true,
    });
  });

  test.afterAll(async () => {
    const webControlPanel = new WebControlPanelHelper(setupPage);
    await webControlPanel.setLicensing(SkinsIds.ZZDemo, originalLicensing);
    await setupPage.close();
  });

  test.describe(`Test3Party gateway`, () => {
    let originalGatewayConfig: Record<string, string> = {};

    test.beforeAll(async () => {
      const webControlPanel = new WebControlPanelHelper(setupPage);
      originalGatewayConfig = await webControlPanel.getGatewayConfig(
        SkinsIds.ZZDemo,
      );
      await webControlPanel.setGatewayConfig(SkinsIds.ZZDemo, {
        "gateway_ids[C]": "test3party",
      });
    });

    test.afterAll(async () => {
      const webControlPanel = new WebControlPanelHelper(setupPage);
      await webControlPanel.setGatewayConfig(
        SkinsIds.ZZDemo,
        originalGatewayConfig,
      );
    });

    test(
      `Complete a ticket sale successfully`,
      { tag: [Tag.Regression, Tag.Smoke] },
      async ({
        zzDemoProductionsPage,
        performancesPage,
        sectionsPage,
        seatsPage,
        bookTypesPage,
        contactDetailsPage,
        bookingProtectPage,
        checkoutPage,
        testThreePartyPage,
        completeSalePage,
      }) => {
        const patron = createPatron();

        await zzDemoProductionsPage.open();
        await zzDemoProductionsPage.clickProduction(ProductionIds.WowShow2027);

        performancesPage.init(ProductionIds.WowShow2027);
        await performancesPage.waitForSelectPerformanceVisible();
        await performancesPage.chooseSeatsForMe();

        await sectionsPage.waitForSelectSectionTextVisible();
        const seatTypeId = await sectionsPage.chooseAvailableSeatType();
        await sectionsPage.clickContinueButton();

        await seatsPage.waitForNumberOfSeatsInputVisible();
        await seatsPage.selectNumberOfSeats(1);
        await seatsPage.clickContinueButton();
        await seatsPage.waitForConfirmSeatsOnHoldBtnVisible();
        await seatsPage.clickConfirmButton();

        await bookTypesPage.waitForBookTypesVisible();
        await bookTypesPage.enterBookTypes(seatTypeId, 1);
        await bookTypesPage.clickCheckoutButton();
        await bookTypesPage.waitCartContainer();
        await bookTypesPage.clickCheckoutNowButton();

        await contactDetailsPage.waitForCreateOptionVisible();
        await contactDetailsPage.registerAsGuest(patron);

        await bookingProtectPage.waitForHeadingVisible();
        await bookingProtectPage.declineProtection();

        await checkoutPage.agreeToTermsAndConditions();
        await checkoutPage.clickCompleteSaleButton();

        await testThreePartyPage.waitForSimulateOkBtnVisible();
        const saleId = testThreePartyPage.getTest3PartySaleId();
        testThreePartyPage.init(saleId);
        await testThreePartyPage.clickSimulateOk();

        completeSalePage.init(saleId);
        await completeSalePage.waitForSaleReceiptTitleVisible();
      },
    );

    test(
      `Complete a ticket sale with Booking Protect accepted`,
      { tag: [Tag.Regression] },
      async ({
        zzDemoProductionsPage,
        performancesPage,
        sectionsPage,
        seatsPage,
        bookTypesPage,
        contactDetailsPage,
        bookingProtectPage,
        checkoutPage,
        testThreePartyPage,
        completeSalePage,
      }) => {
        const patron = createPatron();

        await zzDemoProductionsPage.open();
        await zzDemoProductionsPage.clickProduction(ProductionIds.WowShow2027);

        performancesPage.init(ProductionIds.WowShow2027);
        await performancesPage.waitForSelectPerformanceVisible();
        await performancesPage.chooseSeatsForMe();

        await sectionsPage.waitForSelectSectionTextVisible();
        const seatTypeId = await sectionsPage.chooseAvailableSeatType();
        await sectionsPage.clickContinueButton();

        await seatsPage.waitForNumberOfSeatsInputVisible();
        await seatsPage.selectNumberOfSeats(1);
        await seatsPage.clickContinueButton();
        await seatsPage.waitForConfirmSeatsOnHoldBtnVisible();
        await seatsPage.clickConfirmButton();

        await bookTypesPage.waitForBookTypesVisible();
        await bookTypesPage.enterBookTypes(seatTypeId, 1);
        await bookTypesPage.clickCheckoutButton();
        await bookTypesPage.waitCartContainer();
        await bookTypesPage.clickCheckoutNowButton();

        await contactDetailsPage.waitForCreateOptionVisible();
        await contactDetailsPage.registerAsGuest(patron);

        await bookingProtectPage.waitForHeadingVisible();
        await bookingProtectPage.acceptProtection();

        await checkoutPage.agreeToTermsAndConditions();
        await checkoutPage.clickCompleteSaleButton();

        await testThreePartyPage.waitForSimulateOkBtnVisible();
        const saleId = testThreePartyPage.getTest3PartySaleId();
        testThreePartyPage.init(saleId);
        await testThreePartyPage.clickSimulateOk();

        completeSalePage.init(saleId);
        await completeSalePage.waitForSaleReceiptTitleVisible();
      },
    );

    test(
      `Handle a declined transaction correctly`,
      { tag: [Tag.Regression] },
      async ({
        zzDemoProductionsPage,
        performancesPage,
        sectionsPage,
        seatsPage,
        bookTypesPage,
        contactDetailsPage,
        bookingProtectPage,
        checkoutPage,
        testThreePartyPage,
      }) => {
        const patron = createPatron();

        await zzDemoProductionsPage.open();
        await zzDemoProductionsPage.clickProduction(ProductionIds.WowShow2027);

        performancesPage.init(ProductionIds.WowShow2027);
        await performancesPage.waitForSelectPerformanceVisible();
        await performancesPage.chooseSeatsForMe();

        await sectionsPage.waitForSelectSectionTextVisible();
        const seatTypeId = await sectionsPage.chooseAvailableSeatType();
        await sectionsPage.clickContinueButton();

        await seatsPage.waitForNumberOfSeatsInputVisible();
        await seatsPage.selectNumberOfSeats(1);
        await seatsPage.clickContinueButton();
        await seatsPage.waitForConfirmSeatsOnHoldBtnVisible();
        await seatsPage.clickConfirmButton();

        await bookTypesPage.waitForBookTypesVisible();
        await bookTypesPage.enterBookTypes(seatTypeId, 1);
        await bookTypesPage.clickCheckoutButton();
        await bookTypesPage.waitCartContainer();
        await bookTypesPage.clickCheckoutNowButton();

        await contactDetailsPage.waitForCreateOptionVisible();
        await contactDetailsPage.registerAsGuest(patron);

        await bookingProtectPage.waitForHeadingVisible();
        await bookingProtectPage.declineProtection();

        await checkoutPage.agreeToTermsAndConditions();
        await checkoutPage.clickCompleteSaleButton();

        await testThreePartyPage.waitForSimulateOkBtnVisible();
        await testThreePartyPage.clickSimulateDecline();

        await checkoutPage.expectErrorMessage(
          ErrorMessages.transaction_failed_test_gateway,
        );
      },
    );
  });

  test.describe(`Test2Party gateway`, () => {
    let originalGatewayConfig: Record<string, string> = {};

    test.beforeAll(async () => {
      const webControlPanel = new WebControlPanelHelper(setupPage);
      originalGatewayConfig = await webControlPanel.getGatewayConfig(
        SkinsIds.ZZDemo,
      );
      await webControlPanel.setGatewayConfig(SkinsIds.ZZDemo, {
        "gateway_ids[C]": "test",
        "config[test][currency]": "NZD",
        "config[test][cards][V]": "V",
        "config[test][cards][M]": "M",
      });
    });

    test.afterAll(async () => {
      const webControlPanel = new WebControlPanelHelper(setupPage);
      await webControlPanel.setGatewayConfig(
        SkinsIds.ZZDemo,
        originalGatewayConfig,
      );
    });

    test(
      `Complete a ticket sale successfully`,
      { tag: [Tag.Regression] },
      async ({
        zzDemoProductionsPage,
        performancesPage,
        sectionsPage,
        seatsPage,
        bookTypesPage,
        contactDetailsPage,
        bookingProtectPage,
        checkoutPage,
      }) => {
        const patron = createPatron();

        await zzDemoProductionsPage.open();
        await zzDemoProductionsPage.clickProduction(ProductionIds.WowShow2027);

        performancesPage.init(ProductionIds.WowShow2027);
        await performancesPage.waitForSelectPerformanceVisible();
        await performancesPage.chooseSeatsForMe();

        await sectionsPage.waitForSelectSectionTextVisible();
        const seatTypeId = await sectionsPage.chooseAvailableSeatType();
        await sectionsPage.clickContinueButton();

        await seatsPage.waitForNumberOfSeatsInputVisible();
        await seatsPage.selectNumberOfSeats(1);
        await seatsPage.clickContinueButton();
        await seatsPage.waitForConfirmSeatsOnHoldBtnVisible();
        await seatsPage.clickConfirmButton();

        await bookTypesPage.waitForBookTypesVisible();
        await bookTypesPage.enterBookTypes(seatTypeId, 1);
        await bookTypesPage.clickCheckoutButton();
        await bookTypesPage.waitCartContainer();
        await bookTypesPage.clickCheckoutNowButton();

        await contactDetailsPage.waitForCreateOptionVisible();
        await contactDetailsPage.registerAsGuest(patron);

        await bookingProtectPage.waitForHeadingVisible();
        await bookingProtectPage.declineProtection();

        await checkoutPage.enterCreditCardNumber(TestCard.number);
        await checkoutPage.enterNameOnCard(TestCard.names.pass);
        await checkoutPage.enterExpiryDate();
        await checkoutPage.agreeToTermsAndConditions();
        await checkoutPage.clickCompleteSaleButtonInline();

        await checkoutPage.expectSaleConfirmation();
      },
    );

    test(
      `Handle a declined transaction correctly`,
      { tag: [Tag.Regression] },
      async ({
        zzDemoProductionsPage,
        performancesPage,
        sectionsPage,
        seatsPage,
        bookTypesPage,
        contactDetailsPage,
        bookingProtectPage,
        checkoutPage,
      }) => {
        const patron = createPatron();

        await zzDemoProductionsPage.open();
        await zzDemoProductionsPage.clickProduction(ProductionIds.WowShow2027);

        performancesPage.init(ProductionIds.WowShow2027);
        await performancesPage.waitForSelectPerformanceVisible();
        await performancesPage.chooseSeatsForMe();

        await sectionsPage.waitForSelectSectionTextVisible();
        const seatTypeId = await sectionsPage.chooseAvailableSeatType();
        await sectionsPage.clickContinueButton();

        await seatsPage.waitForNumberOfSeatsInputVisible();
        await seatsPage.selectNumberOfSeats(1);
        await seatsPage.clickContinueButton();
        await seatsPage.waitForConfirmSeatsOnHoldBtnVisible();
        await seatsPage.clickConfirmButton();

        await bookTypesPage.waitForBookTypesVisible();
        await bookTypesPage.enterBookTypes(seatTypeId, 1);
        await bookTypesPage.clickCheckoutButton();
        await bookTypesPage.waitCartContainer();
        await bookTypesPage.clickCheckoutNowButton();

        await contactDetailsPage.waitForCreateOptionVisible();
        await contactDetailsPage.registerAsGuest(patron);

        await bookingProtectPage.waitForHeadingVisible();
        await bookingProtectPage.declineProtection();

        await checkoutPage.enterCreditCardNumber(TestCard.number);
        await checkoutPage.enterNameOnCard(TestCard.names.fail);
        await checkoutPage.enterExpiryDate();
        await checkoutPage.agreeToTermsAndConditions();
        await checkoutPage.clickCompleteSaleButtonInline();

        await checkoutPage.expectErrorMessage(
          ErrorMessages.transaction_failed_test_gateway,
        );
      },
    );
  });
});
