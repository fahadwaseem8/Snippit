import nodemailer from "nodemailer";

function buildResetUrl(origin: string, token: string): string {
  const url = new URL("/reset-password", origin);
  url.searchParams.set("token", token);
  return url.toString();
}

export function createResetToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function hasSmtpConfig(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM,
  );
}

export async function sendPasswordReset(
  email: string,
  origin: string,
  token: string,
): Promise<{ resetLink: string }> {
  const resetLink = buildResetUrl(origin, token);

  if (!hasSmtpConfig()) {
    console.warn("SMTP config not set; skipping password reset email send");
    return { resetLink };
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset your Snippit password",
    text: `Reset your password: ${resetLink}`,
    html: `<p>Reset your Snippit password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });

  return { resetLink };
}
