import * as dotenv from "dotenv";
import { Role } from "../constant/roles.constant";

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
  users: Record<Role, Credentials>;
}

export const ENV = process.env.ENV || "prod";

const credentialsFromEnv = (prefix = ""): Credentials => ({
  login: process.env[`${prefix}LOGIN`] || "",
  password: process.env[`${prefix}PASSWORD`] || "",
  firstName: process.env[`${prefix}FIRST_NAME`] || "",
  lastName: process.env[`${prefix}LAST_NAME`] || "",
});

const users: Record<Role, Credentials> = {
  [Role.Patron]: credentialsFromEnv(),
  [Role.SecondPatron]: credentialsFromEnv("SECOND_"),
};

export const globalConfig: GlobalConfig = {
  env: ENV,
  credentials: users[Role.Patron],
  users,
};
