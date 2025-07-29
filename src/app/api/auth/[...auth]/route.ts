import { NextRequest } from 'next/server';
import { register, login, googleLogin } from './authController';

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url);

  if (pathname === '/api/auth/register') {
    return register(req);
  }

  if (pathname === '/api/auth/login') {
    return login(req);
  }

  if (pathname === '/api/auth/google') {
    return googleLogin(req);
  }

  return new Response(JSON.stringify({ error: 'Invalid endpoint' }), { status: 404 });
}