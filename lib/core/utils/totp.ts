import { generate } from "otplib";

export async function generateTotpCode(secret: string): Promise<string> {
  return generate({ secret });
}
