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

interface RenderTemplateInput {
  origin: string;
  fileName: string;
  replacements: Record<string, string>;
}

const templateCache = new Map<string, string>();

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

async function loadPublicTemplate(
  origin: string,
  fileName: string,
): Promise<string> {
  const cacheKey = `${origin}::${fileName}`;
  const cached = templateCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const templateUrl = new URL(`/email_templates/${fileName}`, origin);
  const response = await fetch(templateUrl.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load email template ${fileName} (status: ${response.status})`,
    );
  }

  const template = await response.text();
  templateCache.set(cacheKey, template);
  return template;
}

export async function renderPublicEmailTemplate(
  input: RenderTemplateInput,
): Promise<string> {
  const template = await loadPublicTemplate(input.origin, input.fileName);

  let rendered = template;
  for (const [placeholder, value] of Object.entries(input.replacements)) {
    rendered = rendered.replaceAll(placeholder, value);
  }

  return rendered;
}
