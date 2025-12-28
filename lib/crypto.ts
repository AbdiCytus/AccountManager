import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

const ENCRYPT_KEY = process.env.ENCRYPTION_KEY || "";

const getKey = () => {
  if (!ENCRYPT_KEY || ENCRYPT_KEY.length !== 64)
    throw new Error("Terjadi kesalahan saat mengenali kunci enkripsi");
  return Buffer.from(ENCRYPT_KEY, "hex");
};

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decrypt = (text: string) => {
  const textParts = text.split(":");

  const ivHex = textParts.shift();
  if (!ivHex) throw new Error("Format data enkripsi salah/rusak");

  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};
