import { BrevoClient } from "@getbrevo/brevo";

const brevoClient = new BrevoClient({
  apiKey: process.env.NEXT_PUBLIC_BREVO_API_KEY!,
});

export const isBrevoConfigured = process.env.NEXT_PUBLIC_BREVO_API_KEY !== undefined;

export default brevoClient;
