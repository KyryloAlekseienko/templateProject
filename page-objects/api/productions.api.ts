import { ApiClient } from "../../utils/ApiClient";
import { testConfig } from "../../configs/config";
import { AppRoutes } from "../../constant/endpoints.constant";

export class ProductionsApi {
  constructor(private readonly api: ApiClient) {}

  public getProductionsHtml(): Promise<string> {
    return this.api.get<string>(`${testConfig.baseUrl}${AppRoutes.productions}`);
  }

  // Welcome block text is rendered server-side for the session owner
  public async getWelcomeText(): Promise<string | undefined> {
    const html = await this.getProductionsHtml();
    return html.match(/Welcome back ([^.<]+)\./)?.[0];
  }
}
