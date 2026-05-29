import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json();

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // ✅ Use this - NO domain needed!
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Email error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
