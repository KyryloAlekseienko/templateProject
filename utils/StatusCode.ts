export class StatusCode {
  static isSuccess(code: number): boolean {
    return code >= 200 && code < 300;
  }

  static isRedirect(code: number): boolean {
    return code >= 300 && code < 400;
  }

  static isClientError(code: number): boolean {
    return code >= 400 && code < 500;
  }

  static isServerError(code: number): boolean {
    return code >= 500 && code < 600;
  }

  static isError(code: number): boolean {
    return this.isClientError(code) || this.isServerError(code);
  }
}
