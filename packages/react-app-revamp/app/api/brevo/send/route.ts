import { NextResponse } from "next/server";
import brevoClient, { isBrevoConfigured } from "@config/brevo";
import type { Brevo } from "@getbrevo/brevo";
import { EmailType } from "lib/email/types";
import { addressSchema } from "lib/supabase/schemas";
import { getEmailForWallet } from "lib/supabase/signups";
import { z } from "zod";

const sendEmailSchema = z.object({
  walletAddress: addressSchema,
  templateId: z.enum(EmailType),
  params: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: Request) {
  if (!isBrevoConfigured) {
    return NextResponse.json({ error: "brevo is not configured" }, { status: 400 });
  }

  const parsed = sendEmailSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  }

  try {
    const { walletAddress, templateId, params } = parsed.data;
    const email = await getEmailForWallet(walletAddress);
    if (!email) {
      return NextResponse.json({ success: false, error: "no email for this wallet" }, { status: 200 });
    }

    const request: Brevo.SendTransacEmailRequest = {
      to: [{ email }],
      templateId,
      ...(params && { params }),
    };

    const data = await brevoClient.transactionalEmails.sendTransacEmail(request);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("error sending email:", error);
    return NextResponse.json({ error: "failed to send email" }, { status: 500 });
  }
}
