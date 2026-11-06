import { postJson } from "@helpers/fetchJson";
import { EmailType, EmailTypeParams, EmailTypeWithParams } from "./types";

interface SendEmailResult {
  success: boolean;
  error?: string;
}

export async function sendEmail<T extends EmailType>(
  walletAddress: string,
  emailType: T,
  params?: T extends EmailTypeWithParams ? EmailTypeParams[T] : undefined,
): Promise<boolean> {
  if (!walletAddress) return false;

  try {
    const data = await postJson<SendEmailResult>("/api/brevo/send", {
      walletAddress,
      templateId: emailType,
      ...(params && { params }),
    });

    if (!data.success) {
      console.log(`failed to send email: ${data.error}`);
      return false;
    }

    return true;
  } catch (error) {
    console.log(`error in email sending process:`, error);
    return false;
  }
}
