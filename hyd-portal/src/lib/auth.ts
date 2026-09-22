import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { Role } from '@prisma/client';
import { prisma } from './prisma';
import { randomToken, sha256 } from './crypto';

const ACCESS = 'hyd_access';
const REFRESH = 'hyd_refresh';

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 24) {
    throw new Error('JWT_SECRET must be set to 24+ characters');
  }
  return new TextEncoder().encode(value);
}

export type AuthUser = {
  id: string;
  phone: string;
  role: Role;
  name: string | null;
  companyId: string | null;
};

export async function signAccess(user: AuthUser): Promise<string> {
  return new SignJWT({ role: user.role, phone: user.phone, companyId: user.companyId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret());
}

export async function issueSession(user: AuthUser) {
  const access = await signAccess(user);
  const refresh = randomToken();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refresh),
      expiresAt: new Date(Date.now() + 14 * 86400000),
    },
  });
  const jar = await cookies();
  const secure = process.env.NODE_ENV === 'production';
  jar.set(ACCESS, access, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 60 * 15 });
  jar.set(REFRESH, refresh, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 60 * 60 * 24 * 14 });
}

export async function clearSession() {
  const jar = await cookies();
  const refresh = jar.get(REFRESH)?.value;
  if (refresh) {
    await prisma.refreshToken.deleteMany({ where: { tokenHash: sha256(refresh) } });
  }
  jar.delete(ACCESS);
  jar.delete(REFRESH);
}

export async function currentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(ACCESS)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      phone: String(payload.phone ?? ''),
      role: payload.role as Role,
      name: null,
      companyId: (payload.companyId as string | null) ?? null,
    };
  } catch {
    return refreshSession();
  }
}

async function refreshSession(): Promise<AuthUser | null> {
  const jar = await cookies();
  const refresh = jar.get(REFRESH)?.value;
  if (!refresh) return null;
  const row = await prisma.refreshToken.findUnique({
    where: { tokenHash: sha256(refresh) },
    include: { user: true },
  });
  if (!row || row.expiresAt < new Date()) return null;
  const user: AuthUser = {
    id: row.user.id,
    phone: row.user.phone,
    role: row.user.role,
    name: row.user.name,
    companyId: row.user.companyId,
  };
  await prisma.refreshToken.delete({ where: { id: row.id } });
  await issueSession(user);
  return user;
}

export function requireRole(user: AuthUser | null, roles: Role[]): AuthUser {
  if (!user || !roles.includes(user.role)) {
    const error = new Error('FORBIDDEN');
    throw error;
  }
  return user;
}
