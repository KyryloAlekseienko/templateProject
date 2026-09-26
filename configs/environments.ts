export interface EnvironmentConfig {
  baseUrl: string;
  apiUrl: string;
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
    baseUrl: "https://localhost:4200",
    apiUrl: "https://localhost:44395",
  },
  qa: {
    baseUrl: "https://zz.patronbase.com",
    apiUrl: "https://localhost:44395",
  },
  stage: {
    baseUrl: "",
    apiUrl: "",
  },
  prod: {
    baseUrl: "",
    apiUrl: "",
  },
};
