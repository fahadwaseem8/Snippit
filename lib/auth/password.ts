const PBKDF2_ITERATIONS = 100000;
const HASH_BITS = 256;
const SALT_BYTES = 16;

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return new Uint8Array(Buffer.from(base64, "base64"));
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const normalizedSalt = new Uint8Array(salt);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: normalizedSalt,
      iterations,
    },
    keyMaterial,
    HASH_BITS,
  );

  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveKey(password, salt, PBKDF2_ITERATIONS);

  return `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parts = storedHash.split("$");

  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") {
    return false;
  }

  const iterations = Number.parseInt(parts[1], 10);

  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  if (iterations > PBKDF2_ITERATIONS) {
    return false;
  }

  const salt = fromBase64Url(parts[2]);
  const expectedHash = fromBase64Url(parts[3]);
  const candidateHash = await deriveKey(password, salt, iterations);

  if (candidateHash.length !== expectedHash.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < candidateHash.length; index += 1) {
    mismatch |= candidateHash[index] ^ expectedHash[index];
  }

  return mismatch === 0;
}
