export interface EnvironmentConfig {
  baseUrl: string;
}

export enum Environment {
  dev = "dev",
  qa = "qa",
  stage = "stage",
  prod = "prod",
}

export const environmentConfig: {
  [key in Environment | string]: EnvironmentConfig;
} = {
  dev: {
    baseUrl: "https://zz.patronbase.com",
  },
  qa: {
    baseUrl: "https://zz.patronbase.com",
  },
  stage: {
    baseUrl: "",
  },
  prod: {
    baseUrl: "https://zz.patronbase.com",
  },
};

export const authConfig = {
  credentials: {
    login: process.env.LOGIN || "",
    password: process.env.PASSWORD || "",
    firstName: process.env.FIRST_NAME || "",
    lastName: process.env.LAST_NAME || "",
  },
};

export const adminAuthConfig = {
  adminCredentials: {
    username: process.env.ADMIN_LOGIN || "",
    password: process.env.ADMIN_PASSWORD || "",
    totpSecret: process.env.ADMIN_TOTP_SECRET || "",
  },
};
