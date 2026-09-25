import { Tag } from "../constant/test-tags.constant";
import { test } from "../lib/core/base-test";
import { testConfig } from "../configs/config";

test.describe(`ZZDemo login`, () => {
  test(
    `Shows error login with invalid user`,
    { tag: [Tag.Regression, Tag.Smoke] },
    async ({ zzDemoProductionsPage }) => {
      await zzDemoProductionsPage.open();
      await zzDemoProductionsPage.login.login(
        "invalid_user@example.com",
        "WrongPass123!",
      );
      await zzDemoProductionsPage.login.expectLoginError(
        "You have not yet registered with us",
      );
    },
  );

  test(
    `Shows error login with incorrect password for a valid user`,
    { tag: [Tag.Regression] },
    async ({ zzDemoProductionsPage }) => {
      await zzDemoProductionsPage.open();
      await zzDemoProductionsPage.login.login(
        testConfig.credentials.login,
        "WrongPass123!",
      );
      await zzDemoProductionsPage.login.expectLoginError("Incorrect password");
    },
  );

  test(
    `Successful login with valid user`,
    { tag: [Tag.Regression, Tag.Smoke] },
    async ({ zzDemoProductionsPage }) => {
      await zzDemoProductionsPage.open();
      await zzDemoProductionsPage.login.login(
        testConfig.credentials.login,
        testConfig.credentials.password,
      );
      await zzDemoProductionsPage.welcomeComponent.expectWelcomeMessage(
        testConfig.credentials.firstName +
          " " +
          testConfig.credentials.lastName,
      );
    },
  );
});
