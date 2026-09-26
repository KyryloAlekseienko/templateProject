import { authFixture as test, expect } from "../../lib/fixtures/auth.fixture";
import { testConfig } from "../../configs/config";
import { Role } from "../../constant/roles.constant";
import { ApiClient } from "../../utils/ApiClient";

/**
 * Cheat sheet for roles + ApiClient. Every HTTP call goes through ApiClient,
 * which carries the role, its credentials and its cached session.
 */
test.describe(`Examples: roles and API`, () => {
  // 1. Guest: no `role` set -> `api` has no session, `page` is anonymous
  test(`guest api`, async ({ api }) => {
    expect(api.role).toBeUndefined();
    expect(await api.productions.getWelcomeText()).toBeUndefined();
  });

  // 2. One role for the whole test: page, page object fixtures and api are the same user
  test.describe(`role for the whole describe`, () => {
    test.use({ role: Role.Patron });

    test(`api and UI share the session`, async ({ api, zzDemoProductionsPage }) => {
      expect(api.credentials?.login).toBe(testConfig.users[Role.Patron].login);

      // Sugar: api.<name>.<method>() instead of new XxxApi(client).<method>()
      await api.example.deleteById(1);
      expect(await api.productions.getWelcomeText()).toContain(
        testConfig.users[Role.Patron].firstName,
      );

      await zzDemoProductionsPage.open();
      await zzDemoProductionsPage.welcomeComponent.expectWelcomeMessage(
        `${testConfig.users[Role.Patron].firstName} ${testConfig.users[Role.Patron].lastName}`,
      );
    });
  });

  // 3. Role fixture: patron.page + patron.<page objects> + patron.api
  test(`role fixture`, async ({ patron }) => {
    await patron.api.example.deleteById(1);

    await patron.zzDemoProductionsPage.open();
    await patron.zzDemoProductionsPage.welcomeComponent.expectWelcomeMessage(
      `${patron.api.credentials?.firstName} ${patron.api.credentials?.lastName}`,
    );
  });

  // 4. Several roles at once: separate browser contexts and separate ApiClients
  test(`two roles in one test`, async ({ patron, secondPatron }) => {
    // arrange by one role through API, check by another through UI
    await patron.api.example.deleteById(1);

    await secondPatron.zzDemoProductionsPage.open();
    await secondPatron.zzDemoProductionsPage.welcomeComponent.expectWelcomeMessage(
      `${secondPatron.api.credentials?.firstName} ${secondPatron.api.credentials?.lastName}`,
    );
  });

  // 5. Role picked at runtime
  test(`loginAs`, async ({ loginAs }) => {
    for (const role of [Role.Patron, Role.SecondPatron]) {
      const session = await loginAs(role);
      expect(await session.api.productions.getWelcomeText()).toContain(
        testConfig.users[role].firstName,
      );
    }
  });

  // 6. Raw ApiClient for an endpoint that has no API class yet
  test(`raw client call`, async ({ patron }) => {
    const client: ApiClient = patron.api.client;

    const html = await client.get<string>(`${testConfig.baseUrl}/_ZZDemo/Productions`);
    expect(html).toContain("pb_welcome");

    // typed JSON call, relative url resolves against testConfig.apiUrl:
    // const order = await client.post<{ id: number }>("/api/orders", { productionId: 1 });
  });

  // 7. Test signs out through UI -> drop the cached session so the next test logs in again
  test(`sign out`, async ({ patron }) => {
    await patron.zzDemoProductionsPage.open();
    await patron.zzDemoProductionsPage.welcomeComponent.signOut();

    await patron.api.client.invalidate();
  });
});
