import { BrowserContext, Page } from "@playwright/test";
import { blockNoise, pageManagerFixture } from "./page-manager.fixture";
import { ApiClients } from "../../utils/ApiClient";
import { ApiManager } from "../../page-objects/api/api-manager";
import { Role } from "../../constant/roles.constant";
import { ZzDemoProductionsPage } from "../../page-objects/pages/zzdemo-productions.page";

// Signed-in browser tab of one role, its page objects and its API objects (same session)
export class RoleSession {
  public readonly zzDemoProductionsPage: ZzDemoProductionsPage;

  constructor(
    public readonly api: ApiManager,
    public readonly page: Page,
  ) {
    this.zzDemoProductionsPage = new ZzDemoProductionsPage(page);
    //TODO
  }
}

type AuthOptions = {
  // Signs in the default `page`, page object fixtures and `api` as this role
  role: Role | undefined;
};

type RoleFixtures = {
  api: ApiManager;
  loginAs: (role: Role) => Promise<RoleSession>;
  patron: RoleSession;
  secondPatron: RoleSession;
};

type AuthWorkerFixtures = {
  apiClients: ApiClients;
};

export const authFixture = pageManagerFixture.extend<
  AuthOptions & RoleFixtures,
  AuthWorkerFixtures
>({
  apiClients: [
    async ({}, use, workerInfo) => {
      const clients = new ApiClients(workerInfo.parallelIndex);
      await use(clients);
      await clients.dispose();
    },
    { scope: "worker" },
  ],

  role: [undefined, { option: true }],

  api: async ({ apiClients, role }, use) => {
    await use(new ApiManager(apiClients.for(role)));
  },

  storageState: async ({ api, storageState }, use) => {
    await use(api.role ? await api.client.storageState() : storageState);
  },

  // Each call opens an isolated browser context, so several roles can act in one test
  loginAs: async ({ browser, apiClients, viewport, baseURL }, use) => {
    const contexts: BrowserContext[] = [];

    await use(async (role) => {
      const api = new ApiManager(apiClients.for(role));
      const context = await browser.newContext({
        storageState: await api.client.storageState(),
        viewport,
        baseURL,
      });
      contexts.push(context);
      await blockNoise(context);

      return new RoleSession(api, await context.newPage());
    });

    await Promise.all(contexts.map((context) => context.close()));
  },

  patron: async ({ loginAs }, use) => {
    await use(await loginAs(Role.Patron));
  },

  secondPatron: async ({ loginAs }, use) => {
    await use(await loginAs(Role.SecondPatron));
  },
});

export { expect } from "@playwright/test";
