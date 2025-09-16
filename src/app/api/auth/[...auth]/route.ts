import { NextRequest, NextResponse } from 'next/server';
import { register, login, googleLogin } from './authController';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

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

  return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 });
}

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);

  if (pathname === '/api/auth/verify') {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      jwt.verify(token, SECRET_KEY);
      return NextResponse.json({ message: 'Token valid' }, { status: 200 });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 });
}