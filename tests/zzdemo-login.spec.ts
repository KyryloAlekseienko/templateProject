import { Tag } from "../constant/test-tags.constant";
import { pageManagerFixture as test} from "../lib/fixtures/page-manager.fixture";
import { testConfig } from "../configs/config";
import { InvalidUsers } from "../constant/invalid-users.constant";

test.describe(`ZZDemo login`, () => {
  test(
    `Shows error login with invalid user`,
    { tag: [Tag.Regression, Tag.Smoke] },
    async ({ zzDemoProductionsPage }) => {
      await zzDemoProductionsPage.open();
      await zzDemoProductionsPage.login.login(InvalidUsers.email, InvalidUsers.password);
      await zzDemoProductionsPage.login.expectLoginError("You have not yet registered with us");
    },
  );

  test(
    `Shows error login with incorrect password for a valid user`,
    { tag: [Tag.Regression] },
    async ({ zzDemoProductionsPage }) => {
      await zzDemoProductionsPage.open();
      await zzDemoProductionsPage.login.login(testConfig.credentials.login, InvalidUsers.password);
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
        testConfig.credentials.firstName + " " + testConfig.credentials.lastName,
      );
    },
  );
});
