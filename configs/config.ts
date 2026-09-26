import { environmentConfig } from "./environments";
import { ENV, globalConfig } from "./global";

export const testConfig = {
  ...environmentConfig[ENV],
  ...globalConfig,
};
