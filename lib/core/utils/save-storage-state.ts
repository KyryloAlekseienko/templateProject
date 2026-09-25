import * as fs from "fs";
import { BrowserContext } from "@playwright/test";
import { authDir, storageStatePath } from "./paths";

export async function saveStorageState(context: BrowserContext) {
  fs.mkdirSync(authDir, { recursive: true });

  await context.storageState({ path: storageStatePath });
}
