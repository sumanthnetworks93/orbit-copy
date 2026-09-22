import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function randomToken(): string {
  return randomBytes(32).toString('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return '••••';
  return `${digits.slice(0, 2)}••••••${digits.slice(-2)}`;
}

export function indianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '').slice(-10);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return digits;
}
