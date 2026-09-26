import { ApiClient } from "../../utils/ApiClient";
import { ExampleApi } from "./example.api";
import { ProductionsApi } from "./productions.api";

type ApiClass<T> = new (client: ApiClient) => T;

/**
 * Facade over all API objects of one role: `patron.api.example.deleteById(1)`
 * instead of `new ExampleApi(patron.api).deleteById(1)`.
 * Each API object is created on first access and then reused.
 */
export class ApiManager {
  private readonly instances = new Map<ApiClass<unknown>, unknown>();

  constructor(public readonly client: ApiClient) {}

  get role() {
    return this.client.role;
  }

  get credentials() {
    return this.client.credentials;
  }

  get example(): ExampleApi {
    return this.lazy(ExampleApi);
  }

  get productions(): ProductionsApi {
    return this.lazy(ProductionsApi);
  }
  //TODO: new API = one getter here

  private lazy<T>(Api: ApiClass<T>): T {
    if (!this.instances.has(Api)) {
      this.instances.set(Api, new Api(this.client));
    }
    return this.instances.get(Api) as T;
  }
}
