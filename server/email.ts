import { ENV } from "./_core/env";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using the configured email service
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, text } = options;
  const provider = ENV.emailServiceProvider;
  const apiKey = ENV.emailServiceApiKey;
  const fromAddress = ENV.emailFromAddress;

  if (!provider || !apiKey || !fromAddress) {
    console.error("[Email] Missing email service configuration");
    return { success: false, error: "Email service not configured" };
  }

  try {
    if (provider === "resend") {
      return await sendViaResend(apiKey, fromAddress, to, subject, html, text);
    } else if (provider === "sendgrid") {
      return await sendViaSendGrid(apiKey, fromAddress, to, subject, html, text);
    } else if (provider === "mailgun") {
      return await sendViaMailgun(apiKey, fromAddress, to, subject, html, text);
    } else {
      return { success: false, error: `Unknown email provider: ${provider}` };
    }
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send email via Resend
 */
async function sendViaResend(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.message || "Failed to send email via Resend" };
  }

  return { success: true };
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [
        { type: "text/plain", value: text || "" },
        { type: "text/html", value: html },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: error || "Failed to send email via SendGrid" };
  }

  return { success: true };
}

/**
 * Send email via Mailgun
 */
async function sendViaMailgun(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string }> {
  // Extract domain from sender email
  const domain = from.split("@")[1];
  if (!domain) {
    return { success: false, error: "Invalid sender email format" };
  }

  const formData = new FormData();
  formData.append("from", from);
  formData.append("to", to);
  formData.append("subject", subject);
  formData.append("html", html);
  if (text) formData.append("text", text);

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.message || "Failed to send email via Mailgun" };
  }

  return { success: true };
}
