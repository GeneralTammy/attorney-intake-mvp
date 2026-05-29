"use client";

import { useState } from "react";

export default function TestEmail() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const sendTestEmail = async () => {
    setLoading(true);
    setResult("Sending...");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "your-email@example.com", // Replace with your email
          subject: "CaseReady Test Email",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #3B5BDB; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; border: 1px solid #e5e7eb; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Case<span style="color: #a5b4fc;">Ready</span></h1>
                </div>
                <div class="content">
                  <h2>Test Email</h2>
                  <p>This is a test email from your CaseReady application.</p>
                  <p>If you received this, your email integration is working correctly!</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} CaseReady. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(`✅ Email sent successfully! ID: ${data.id}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`❌ Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={sendTestEmail}
        disabled={loading}
        className="px-4 py-2 bg-[#3B5BDB] text-white rounded-lg hover:bg-[#2F4AC2] disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Test Email"}
      </button>
      {result && <p className="mt-4 text-sm">{result}</p>}
    </div>
  );
}
