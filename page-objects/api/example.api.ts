import { ApiClient } from "../../utils/ApiClient";

// API objects get the ApiClient of a role, so requests go out with that role's session
export class ExampleApi {
  constructor(private readonly api: ApiClient) {}

  public async deleteById(id: number): Promise<void> {
    // console.log(`[${this.api.role}] Deleting ID=${id}`);
    // await this.api.delete<{
    //   statusCode: number;
    //   message: string;
    //   isError: boolean;
    // }>(`${API_ENDPOINT.....}/${id}`);
  }
}
