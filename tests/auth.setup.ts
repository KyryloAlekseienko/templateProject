// import { test as setup } from "@playwright/test";
// import { testConfig } from "../configs/config";
// import { LoginPage } from "../page-objects/pages/login.page";
// import { saveStorageState } from "../lib/core/utils/save-storage-state";
//
// setup("Authentication", async ({ page }) => {
//   const loginPage = new LoginPage(page);
//
//   await loginPage.open();
//   await loginPage.login(
//     testConfig.credentials.login,
//     testConfig.credentials.password,
//   );
//
//   await saveStorageState(page.context());
// });
