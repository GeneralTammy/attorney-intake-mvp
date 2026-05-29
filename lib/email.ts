import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from:
        from || process.env.FROM_EMAIL || "noreply@casereadylegal.vercel.app",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Email error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: String(error) };
  }
}

// Template for welcome email
export function getWelcomeEmailTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 560px; margin: 0 auto; padding: 20px; }
        .header { background: #3B5BDB; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: #3B5BDB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Case<span style="color: #a5b4fc;">Ready</span></h1>
        </div>
        <div class="content">
          <h2>Welcome to CaseReady, ${name}!</h2>
          <p>Thank you for choosing CaseReady. We're excited to help you streamline your client intake process.</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Create your first client intake</li>
            <li>Upload case documents</li>
            <li>Generate readiness reports</li>
          </ul>
          <a href="https://casereadylegal.vercel.app/dashboard" class="button">Go to Dashboard</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CaseReady. Built for attorneys.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template for report ready notification
export function getReportReadyEmailTemplate(
  clientName: string,
  score: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 560px; margin: 0 auto; padding: 20px; }
        .header { background: #3B5BDB; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .score { font-size: 48px; font-weight: bold; color: #3B5BDB; text-align: center; margin: 20px 0; }
        .content { padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Case<span style="color: #a5b4fc;">Ready</span></h1>
        </div>
        <div class="content">
          <h2>Readiness Report Ready!</h2>
          <p>The case readiness report for <strong>${clientName}</strong> is now available.</p>
          <div class="score">${score}% Complete</div>
          <a href="https://casereadylegal.vercel.app/dashboard" class="button" style="display: inline-block; background: #3B5BDB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Report</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CaseReady. Built for attorneys.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
