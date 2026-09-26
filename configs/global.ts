import * as dotenv from "dotenv";

dotenv.config();

export interface Credentials {
  login: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface GlobalConfig {
  env: string;
  credentials: Credentials;
}

export const ENV = process.env.ENV || "prod";

export const globalConfig: GlobalConfig = {
  env: ENV,
  credentials: {
    login: process.env.LOGIN || "",
    password: process.env.PASSWORD || "",
    firstName: process.env.FIRST_NAME || "",
    lastName: process.env.LAST_NAME || "",
  },
};
