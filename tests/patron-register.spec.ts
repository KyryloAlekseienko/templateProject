import { Tag } from "../constant/test-tags.constant";
import { test } from "../lib/core/base-test";
import { createPatron } from "../page-objects/data/patron.data";
import { SkinsIds } from "../constant/skins.constant";
import { SectionSettings } from "../constant/section-settings.constant";
import { ErrorMessages } from "../constant/error-messages.constant";

test.describe(`Patron registration`, () => {
  test(
    `Successful registration with valid details`,
    { tag: [Tag.Regression, Tag.Smoke] },
    async ({ patronRegisterPage }) => {
      const patron = createPatron();

      await patronRegisterPage.open();
      await patronRegisterPage.register(patron);
      await patronRegisterPage.expectSuccessMessage();
    },
  );

  test(
    `Shows error when password confirmation does not match`,
    { tag: [Tag.Regression] },
    async ({ patronRegisterPage }) => {
      const patron = createPatron();

      await patronRegisterPage.open();
      await patronRegisterPage.fillContactDetails(patron);
      await patronRegisterPage.fillPassword(patron.password, "something-else");
      await patronRegisterPage.submit();
      await patronRegisterPage.expectErrorMessage(
        ErrorMessages.passwords_not_match,
      );
    },
  );
});

test.describe(`Patron registration - WCP setting variants`, () => {
  test.describe.configure({ mode: "serial" });

  const patronsSettingKeys = [
    "require_2x_email",
    "full_address_required",
    "require_postcode",
    "show_only_postcode",
    "collect_sex",
    "collect_sex_dob_on_checkout",
    "require_sex",
  ];
  let originalPatronsSettings: Record<string, boolean> = {};

  test.beforeEach(async ({ webControlPanel }) => {
    originalPatronsSettings = await webControlPanel.getSectionSettings(
      SkinsIds.ZZDemo,
      SectionSettings.patrons,
      patronsSettingKeys,
    );
  });

  test.afterEach(async ({ webControlPanel }) => {
    await webControlPanel.setSectionSettings(
      SkinsIds.ZZDemo,
      SectionSettings.patrons,
      originalPatronsSettings,
    );
  });

  test(
    `Requires double email entry when enabled`,
    { tag: [Tag.Regression] },
    async ({ patronRegisterPage, webControlPanel }, testInfo) => {
      testInfo.setTimeout(120_000);
      await webControlPanel.setSectionSettings(
        SkinsIds.ZZDemo,
        SectionSettings.patrons,
        { require_2x_email: true },
      );

      const patron = createPatron();

      await patronRegisterPage.open();
      await patronRegisterPage.enterBasicContactDetails(patron);
      await patronRegisterPage.enterHomePhoneNumber(patron);
      await patronRegisterPage.enterAddressStreet(patron);
      await patronRegisterPage.enterCountry(patron.country);
      await patronRegisterPage.fillPassword(patron.password);
      await patronRegisterPage.submit();

      await patronRegisterPage.expectErrorMessage(
        ErrorMessages.email_not_match,
      );

      await patronRegisterPage.enterSecondEmailAddress("incorrect@email.com");
      await patronRegisterPage.submit();
      await patronRegisterPage.expectErrorMessage(
        ErrorMessages.email_not_match,
      );

      await patronRegisterPage.enterSecondEmailAddress(patron.email);
      await patronRegisterPage.submit();
      await patronRegisterPage.expectSuccessMessage();
    },
  );

  test(
    `Requires postcode and gender when enabled`,
    { tag: [Tag.Regression] },
    async ({ patronRegisterPage, webControlPanel }, testInfo) => {
      testInfo.setTimeout(120_000);
      await webControlPanel.setSectionSettings(
        SkinsIds.ZZDemo,
        SectionSettings.patrons,
        {
          full_address_required: true,
          require_postcode: true,
          show_only_postcode: true,
          collect_sex: true,
          collect_sex_dob_on_checkout: true,
          require_sex: true,
        },
      );

      const patron = createPatron();

      await patronRegisterPage.open();
      await patronRegisterPage.enterBasicContactDetails(patron);
      await patronRegisterPage.enterHomePhoneNumber(patron);
      await patronRegisterPage.enterCountry(patron.country);
      await patronRegisterPage.fillPassword(patron.password);
      await patronRegisterPage.submit();
      await patronRegisterPage.expectErrorMessage(ErrorMessages.postcode);

      await patronRegisterPage.enterPostcode(patron.postcode);
      await patronRegisterPage.submit();
      await patronRegisterPage.expectErrorMessage(ErrorMessages.gender);

      await patronRegisterPage.enterGender("F");
      await patronRegisterPage.submit();
      await patronRegisterPage.expectSuccessMessage();
    },
  );
});
