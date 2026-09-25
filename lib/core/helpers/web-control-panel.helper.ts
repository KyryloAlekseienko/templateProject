import { Page } from "@playwright/test";
import { HqLoginPage } from "../../../page-objects/pages/admin/hq-login.page";
import { AppRoutes } from "../../../constant/endpoints.constant";
import { testConfig } from "../../../configs/config";

type SettingValue = string | boolean;

export class WebControlPanelHelper {
  constructor(private readonly page: Page) {}

  private async ensureAdminSession() {
    await this.page.goto(`${testConfig.baseUrl}${AppRoutes.adminHQList}`, {
      waitUntil: "domcontentloaded",
    });

    if (this.page.url().includes(AppRoutes.adminHQLogin)) {
      const hqLogin = new HqLoginPage(this.page);
      await hqLogin.login(
        testConfig.adminCredentials.username,
        testConfig.adminCredentials.password,
      );
      await hqLogin.submitTotpToken(testConfig.adminCredentials.totpSecret);
      await this.page.waitForLoadState("load");
    }
  }

  private toForm(fields: Record<string, SettingValue>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [
        key,
        typeof value === "boolean" ? (value ? "1" : "0") : value,
      ]),
    );
  }

  public async getLicensing(
    orgId: string,
    keys: string[],
  ): Promise<Record<string, boolean>> {
    await this.ensureAdminSession();
    await this.page.goto(
      `${testConfig.baseUrl}${AppRoutes.adminHQLicensing}?id=${orgId}`,
      {
        waitUntil: "domcontentloaded",
      },
    );

    return this.page.evaluate((keys) => {
      const result: Record<string, boolean> = {};
      for (const key of keys) {
        const el = document.querySelector(
          `[name="${key}"]`,
        ) as HTMLInputElement | null;
        result[key] = el ? el.checked : false;
      }
      return result;
    }, keys);
  }

  public async setLicensing(orgId: string, licenses: Record<string, boolean>) {
    await this.ensureAdminSession();

    const url = `${testConfig.baseUrl}${AppRoutes.adminHQLicensing}?id=${orgId}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });

    const currentCheckboxes = await this.page.evaluate(() =>
      Object.fromEntries(
        Array.from(
          document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
        )
          .filter((el) => el.name)
          .map((el) => [el.name, el.checked]),
      ),
    );

    const response = await this.page
      .context()
      .request.post(`${testConfig.baseUrl}${AppRoutes.adminHQLicensing}`, {
        form: {
          id: orgId,
          submit: "1",
          ...this.toForm(currentCheckboxes),
          ...this.toForm(licenses),
        },
      });

    if (!response.ok()) {
      throw new Error(
        `Failed to save licensing for ${orgId}: ${response.status()} ${await response.text()}`,
      );
    }
  }

  private async ensureOperatorSession(orgId: string) {
    await this.ensureAdminSession();

    const response = await this.page
      .context()
      .request.post(`${testConfig.baseUrl}/Admin/HQ/LogInAsOperator`, {
        form: { id: orgId, section: "2", submit: "1" },
      });

    if (!response.ok()) {
      throw new Error(
        `Failed to log in as operator for ${orgId}: ${response.status()} ${await response.text()}`,
      );
    }
  }

  public async getSectionSettings(
    orgId: string,
    section: string,
    keys: string[],
  ): Promise<Record<string, boolean>> {
    await this.ensureOperatorSession(orgId);
    await this.page.goto(
      `${testConfig.baseUrl}${AppRoutes.adminSettings(orgId, section)}`,
      {
        waitUntil: "domcontentloaded",
      },
    );

    return this.page.evaluate((keys) => {
      const result: Record<string, boolean> = {};
      for (const key of keys) {
        const el = document.querySelector(
          `[name="${key}"]`,
        ) as HTMLInputElement | null;
        result[key] = el ? el.checked : false;
      }
      return result;
    }, keys);
  }

  public async setSectionSettings(
    orgId: string,
    section: string,
    fields: Record<string, SettingValue>,
  ) {
    await this.ensureOperatorSession(orgId);

    const url = `${testConfig.baseUrl}${AppRoutes.adminSettings(orgId, section)}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });

    const currentCheckboxes = await this.page.evaluate(() =>
      Object.fromEntries(
        Array.from(
          document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
        )
          .filter((el) => el.name)
          .map((el) => [el.name, el.checked]),
      ),
    );

    const response = await this.page.context().request.post(url, {
      form: {
        submit: "1",
        ...this.toForm(currentCheckboxes),
        ...this.toForm(fields),
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to save "${section}" settings for ${orgId}: ${response.status()} ${await response.text()}`,
      );
    }
  }

  private async captureFormState(url: string): Promise<Record<string, string>> {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });

    return this.page.evaluate(() => {
      const result: Record<string, string> = {};
      document
        .querySelectorAll<HTMLInputElement>("form input[name]")
        .forEach((el) => {
          if (el.type === "checkbox" || el.type === "radio") {
            if (el.checked) result[el.name] = el.value;
          } else if (el.type !== "submit" && el.type !== "button") {
            result[el.name] = el.value;
          }
        });
      document
        .querySelectorAll<HTMLSelectElement>("form select[name]")
        .forEach((el) => {
          result[el.name] = el.value;
        });
      document
        .querySelectorAll<HTMLTextAreaElement>("form textarea[name]")
        .forEach((el) => {
          result[el.name] = el.value;
        });
      return result;
    });
  }

  public async getGatewayConfig(
    orgId: string,
  ): Promise<Record<string, string>> {
    await this.ensureAdminSession();
    return this.captureFormState(
      `${testConfig.baseUrl}${AppRoutes.adminHQCC}?id=${orgId}`,
    );
  }

  public async setGatewayConfig(orgId: string, fields: Record<string, string>) {
    await this.ensureAdminSession();

    await this.page.goto(
      `${testConfig.baseUrl}${AppRoutes.adminHQCC}?id=${orgId}`,
      { waitUntil: "domcontentloaded" },
    );

    const [gatewaySelects, gatewayFields] = [
      Object.entries(fields).filter(([name]) =>
        name.startsWith("gateway_ids["),
      ),
      Object.entries(fields).filter(
        ([name]) => !name.startsWith("gateway_ids["),
      ),
    ];

    for (const [name, value] of [...gatewaySelects, ...gatewayFields]) {
      const matches = this.page.locator(`[name="${name}"]`);
      try {
        await matches.first().waitFor({ state: "attached", timeout: 5000 });
      } catch {
        continue;
      }
      const count = await matches.count();

      if (count > 1) {
        const radio = this.page.locator(`[name="${name}"][value="${value}"]`);
        if ((await radio.count()) > 0 && (await radio.first().isVisible())) {
          await radio.first().check();
        }
        continue;
      }

      const field = matches.first();
      if (!(await field.isVisible())) continue;

      const tagName = await field.evaluate((el) => el.tagName);
      if (tagName === "SELECT") {
        await field.selectOption(value);
      } else if ((await field.getAttribute("type")) === "checkbox") {
        if (value === "1" || value === "true") await field.check();
        else await field.uncheck();
      } else {
        await field.fill(value);
      }
    }

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url() === `${testConfig.baseUrl}${AppRoutes.adminHQCC}` &&
          response.request().method() === "POST",
      ),
      this.page
        .locator('form input[type="submit"], form button[type="submit"]')
        .first()
        .click(),
    ]);

    if (!response.ok()) {
      throw new Error(
        `Failed to save gateway config for ${orgId}: ${response.status()} ${await response.text()}`,
      );
    }
  }

  public async setWebControlPanelSettings(
    orgId: string,
    options: {
      licenses?: Record<string, boolean>;
      settings?: Record<string, Record<string, SettingValue>>;
    },
  ) {
    if (options.licenses) {
      await this.setLicensing(orgId, options.licenses);
    }

    for (const [section, fields] of Object.entries(options.settings ?? {})) {
      await this.setSectionSettings(orgId, section, fields);
    }
  }
}
