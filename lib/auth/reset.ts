import {
  isSmtpConfigured,
  renderPublicEmailTemplate,
  sendEmail,
} from "@/lib/email";

function buildResetUrl(origin: string, token: string): string {
  const url = new URL("/reset-password", origin);
  url.searchParams.set("token", token);
  return url.toString();
}

function fallbackResetPasswordHtml(resetLink: string): string {
  return [
    "<p>Reset your Snippit password</p>",
    `<p><a href=\"${resetLink}\">${resetLink}</a></p>`,
  ].join("");
}

async function buildResetPasswordHtml(
  resetLink: string,
  siteUrl: string,
  origin: string,
): Promise<string> {
  try {
    return await renderPublicEmailTemplate({
      origin,
      fileName: "reset_password.html",
      replacements: {
        "{{ .ConfirmationURL }}": resetLink,
        "{{ .SiteURL }}": siteUrl,
      },
    });
  } catch (error) {
    console.error("Failed to load reset email template:", error);
    return fallbackResetPasswordHtml(resetLink);
  }
}

export function createResetToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function sendPasswordReset(
  email: string,
  origin: string,
  token: string,
): Promise<{ resetLink: string }> {
  const resetLink = buildResetUrl(origin, token);

  if (!isSmtpConfigured()) {
    console.warn("SMTP config not set; skipping password reset email send");
    return { resetLink };
  }

  const siteUrl = new URL(origin).toString();

  const html = await buildResetPasswordHtml(resetLink, siteUrl, origin);

  await sendEmail({
    to: email,
    subject: "Reset your Snippit password",
    text: [
      "Reset your Snippit password",
      "",
      `Use this link to reset your password: ${resetLink}`,
      "",
      "If you didn't request this, you can safely ignore this email.",
    ].join("\n"),
    html,
  });

  return { resetLink };
}
