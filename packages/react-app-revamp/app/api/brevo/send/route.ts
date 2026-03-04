import { NextResponse } from "next/server";
import brevoClient, { isBrevoConfigured } from "@config/brevo";
import type { Brevo } from "@getbrevo/brevo";

export async function POST(req: Request) {
  if (!isBrevoConfigured) {
    return NextResponse.json({ error: "brevo is not configured" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { to, templateId, params } = body;

    if (!to || !templateId) {
      return NextResponse.json(
        { error: "missing required parameters: to and templateId are required" },
        { status: 400 },
      );
    }

    const request: Brevo.SendTransacEmailRequest = {
      to,
      templateId,
      ...(params && { params }),
    };

    const data = await brevoClient.transactionalEmails.sendTransacEmail(request);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error("error sending email:", error);
    return NextResponse.json({ error: error.message ?? "failed to send email" }, { status: 400 });
  }
}
