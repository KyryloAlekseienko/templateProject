import { Tag } from "../../constant/test-tags.constant";
import { authFixture as test } from "../../lib/fixtures/auth.fixture";
import { testConfig } from "../../configs/config";
import { Role } from "../../constant/roles.constant";

const fullName = (role: Role) =>
  `${testConfig.users[role].firstName} ${testConfig.users[role].lastName}`;

test.describe(`ZZDemo roles`, () => {
  test.describe(`default page signed in as patron`, () => {
    test.use({ role: Role.Patron });

    test(
      `Patron sees welcome message`,
      { tag: [Tag.Regression] },
      async ({ zzDemoProductionsPage }) => {
        await zzDemoProductionsPage.open();
        await zzDemoProductionsPage.welcomeComponent.expectWelcomeMessage(fullName(Role.Patron));
      },
    );
  });

  test(`Role fixture`, { tag: [Tag.Regression] }, async ({ patron }) => {
    await patron.zzDemoProductionsPage.open();
    await patron.zzDemoProductionsPage.welcomeComponent.expectWelcomeMessage(fullName(Role.Patron));
  });

  test.describe(`several roles`, () => {
    test(`Two roles in one test`, { tag: [Tag.Regression] }, async ({ patron, secondPatron }) => {
      await patron.zzDemoProductionsPage.open();
      await secondPatron.zzDemoProductionsPage.open();

      await patron.zzDemoProductionsPage.welcomeComponent.expectWelcomeMessage(
        fullName(Role.Patron),
      );
      await secondPatron.zzDemoProductionsPage.welcomeComponent.expectWelcomeMessage(
        fullName(Role.SecondPatron),
      );
    });
  });
});
