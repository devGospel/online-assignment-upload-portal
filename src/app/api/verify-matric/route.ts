// /app/api/verify-matric/route.ts
import { NextRequest, NextResponse } from 'next/server';
import client from '../../lib/db';
import { verifyToken } from '../../lib/auth'; // Assume this utility decodes JWT

export async function POST(req: NextRequest) {
  try {
    const { matricNumber } = await req.json();
    const token = req.headers.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token to get user data
    const user = await verifyToken(token);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Validate matric number format (e.g., 2019/1/76042CT)
    if (!/^\d{4}\/\d\/[0-9A-Z]{5,7}$/.test(matricNumber)) {
      return NextResponse.json(
        { error: 'Invalid matric number format (e.g., 2019/1/76042CT)' },
        { status: 400 }
      );
    }

    // Fetch user from database to verify matric number
    const query = 'SELECT matric_number FROM users WHERE id = $1';
    const result = await client.query(query, [user.id]);
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const storedMatricNumber = result.rows[0].matric_number;
    if (storedMatricNumber.toUpperCase() !== matricNumber.toUpperCase()) {
      return NextResponse.json(
        { error: 'Invalid matric number. Please try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}