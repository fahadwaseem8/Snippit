import nodemailer from "nodemailer";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === "true",
    user,
    pass,
    from,
  };
}

export function isSmtpConfigured(): boolean {
  return Boolean(getSmtpConfig());
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const config = getSmtpConfig();

  if (!config) {
    return false;
  }

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transport.sendMail({
    from: config.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return true;
}
