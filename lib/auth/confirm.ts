import {
  isSmtpConfigured,
  renderPublicEmailTemplate,
  sendEmail,
} from "@/lib/email";

export function createEmailConfirmationToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function buildConfirmationUrl(origin: string, token: string): string {
  const url = new URL("/api/auth/confirm", origin);
  url.searchParams.set("token", token);
  return url.toString();
}

function fallbackConfirmSignupHtml(confirmationLink: string): string {
  return [
    "<p>Welcome to Snippit.</p>",
    "<p>Confirm your account with this link:</p>",
    `<p><a href=\"${confirmationLink}\">${confirmationLink}</a></p>`,
  ].join("");
}

export async function sendSignupConfirmation(
  email: string,
  origin: string,
  token: string,
): Promise<{ confirmationLink: string }> {
  const confirmationLink = buildConfirmationUrl(origin, token);

  if (!isSmtpConfigured()) {
    console.warn("SMTP config not set; skipping signup confirmation email send");
    return { confirmationLink };
  }

  const siteUrl = new URL(origin).toString();

  let html = fallbackConfirmSignupHtml(confirmationLink);

  try {
    html = await renderPublicEmailTemplate({
      origin,
      fileName: "confirm_signup.html",
      replacements: {
        "{{ .ConfirmationURL }}": confirmationLink,
        "{{ .SiteURL }}": siteUrl,
      },
    });
  } catch (error) {
    console.error("Failed to load confirm signup email template:", error);
  }

  await sendEmail({
    to: email,
    subject: "Confirm your Snippit account",
    text: [
      "Welcome to Snippit.",
      "",
      `Confirm your account using this link: ${confirmationLink}`,
      "",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html,
  });

  return { confirmationLink };
}
