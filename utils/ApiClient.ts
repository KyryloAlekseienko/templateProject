import { APIRequestContext, APIResponse, request } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { testConfig } from "../configs/config";
import { Credentials } from "../configs/global";
import { AppRoutes } from "../constant/endpoints.constant";
import { Role } from "../constant/roles.constant";
import { StatusCode } from "./StatusCode";

type Method = "get" | "post" | "put" | "delete";
type RequestOptions = Parameters<APIRequestContext["fetch"]>[1];

// Block rendered only for a signed-in patron (see WelcomeComponent)
const LOGGED_IN_MARKER = /id=['"]pb_welcome['"]/;
const authDir = path.resolve("auth", testConfig.env);

/**
 * Single entry point for every HTTP call in tests.
 * One instance = one role (or a guest when role is undefined) with its own cookie jar.
 * The session is cached in auth/<env>/<role>.worker-<N>.json and reused between runs;
 * the browser context of the same role is created from this file, so UI and API share the session.
 */
export class ApiClient {
  private context?: APIRequestContext;
  private session?: Promise<void>;

  constructor(
    public readonly role: Role | undefined,
    private readonly workerSlot = 0,
  ) {}

  get credentials(): Credentials | undefined {
    return this.role ? testConfig.users[this.role] : undefined;
  }

  get storageStatePath(): string | undefined {
    return this.role
      ? path.join(authDir, `${this.role}.worker-${this.workerSlot}.json`)
      : undefined;
  }

  // Makes sure the session is alive and returns the file for browser.newContext({ storageState })
  public async storageState(): Promise<string | undefined> {
    await this.ensureSession();
    return this.storageStatePath;
  }

  public get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.execute<T>("get", url, options);
  }

  public post<T>(
    url: string,
    data?: unknown,
    options?: { multipart?: Record<string, any>; form?: Record<string, string> },
  ): Promise<T> {
    return this.execute<T>("post", url, options?.multipart || options?.form ? options : { data });
  }

  public put<T>(url: string, data?: unknown): Promise<T> {
    return this.execute<T>("put", url, { data });
  }

  public delete<T>(url: string, data?: unknown): Promise<T> {
    return this.execute<T>("delete", url, { data });
  }

  public relogin(): Promise<void> {
    this.session = this.login();
    this.session.catch(() => (this.session = undefined));
    return this.session;
  }

  // Drop the cached session, e.g. after the test signed out through the UI
  public async invalidate(): Promise<void> {
    await this.reset();
    if (this.storageStatePath) fs.rmSync(this.storageStatePath, { force: true });
  }

  public async dispose(): Promise<void> {
    await this.reset();
  }

  private async execute<T>(
    method: Method,
    url: string,
    options?: RequestOptions,
    isRetry = false,
  ): Promise<T> {
    await this.ensureSession();

    const res = await this.send(method, url, options);

    if (res.status() === 401 && this.role && !isRetry) {
      console.log(`[auth:${this.role}] 401 on ${method.toUpperCase()} ${url}, relogin and retry`);
      await this.relogin();
      return this.execute<T>(method, url, options, true);
    }

    await this.handleError(res, method.toUpperCase(), url);

    const contentType = res.headers()["content-type"] ?? "";
    return (contentType.includes("json") ? await res.json() : await res.text()) as T;
  }

  // Raw call without session checks, used by the auth flow itself
  private async send(method: Method, url: string, options?: RequestOptions): Promise<APIResponse> {
    this.context ??= await request.newContext({
      baseURL: testConfig.apiUrl,
      storageState:
        this.storageStatePath && fs.existsSync(this.storageStatePath)
          ? this.storageStatePath
          : undefined,
      extraHTTPHeaders: {
        Accept: "application/json, text/plain, */*",
        Origin: testConfig.baseUrl,
      },
    });

    return this.context[method](url, options);
  }

  private ensureSession(): Promise<void> {
    if (!this.role) return Promise.resolve();

    if (!this.session) {
      this.session = this.restoreOrLogin();
      this.session.catch(() => (this.session = undefined));
    }
    return this.session;
  }

  private async restoreOrLogin() {
    if (this.hasUnexpiredCookies() && (await this.isLoggedIn())) {
      console.log(`[auth:${this.role}] reuse ${this.storageStatePath}`);
      return;
    }
    await this.login();
  }

  private async login() {
    const credentials = this.credentials!;
    if (!credentials.login || !credentials.password) {
      throw new Error(`[auth:${this.role}] login/password are empty, check .env`);
    }

    // Start from an empty cookie jar, otherwise the stale PHPSESSID is sent along
    await this.closeContext();
    if (fs.existsSync(this.storageStatePath!)) fs.rmSync(this.storageStatePath!);

    // Same POST the sidebar login form sends; the session lands in the PHPSESSID cookie
    const res = await this.send("post", `${testConfig.baseUrl}${AppRoutes.login}`, {
      form: {
        url: AppRoutes.productions,
        login_email: credentials.login,
        login_password: credentials.password,
        login: "Sign In",
      },
    });

    if (!res.ok() || !(await this.isLoggedIn())) {
      throw new Error(
        `[auth:${this.role}] login failed for ${credentials.login} (${res.status()})`,
      );
    }

    const file = this.storageStatePath!;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await this.context!.storageState({ path: `${file}.tmp` });
    fs.renameSync(`${file}.tmp`, file);
    console.log(`[auth:${this.role}] logged in as ${credentials.login}`);
  }

  private async isLoggedIn(): Promise<boolean> {
    const res = await this.send("get", `${testConfig.baseUrl}${AppRoutes.productions}`);
    return res.ok() && LOGGED_IN_MARKER.test(await res.text());
  }

  private hasUnexpiredCookies(): boolean {
    try {
      const state = JSON.parse(fs.readFileSync(this.storageStatePath!, "utf8")) as {
        cookies: { expires: number }[];
      };
      const now = Date.now() / 1000;
      return (
        state.cookies.length > 0 && state.cookies.every((c) => c.expires === -1 || c.expires > now)
      );
    } catch {
      return false;
    }
  }

  private async reset() {
    this.session = undefined;
    await this.closeContext();
  }

  private async closeContext() {
    await this.context?.dispose();
    this.context = undefined;
  }

  private async handleError(res: APIResponse, method: string, url: string) {
    if (StatusCode.isError(res.status())) {
      const text = await res.text();
      throw new Error(
        `${method} failed:\n  URL: ${url}\n  Status: ${res.status()}\n  Response: ${text}`,
      );
    }
  }
}

// Worker-scoped registry: one ApiClient per role per worker
export class ApiClients {
  private readonly clients = new Map<Role | undefined, ApiClient>();

  constructor(private readonly workerSlot: number) {}

  for(role?: Role): ApiClient {
    let client = this.clients.get(role);
    if (!client) {
      client = new ApiClient(role, this.workerSlot);
      this.clients.set(role, client);
    }
    return client;
  }

  async dispose() {
    await Promise.all([...this.clients.values()].map((client) => client.dispose()));
  }
}
