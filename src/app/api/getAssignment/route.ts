import { NextRequest, NextResponse } from 'next/server';
import client from '../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const query = `
      SELECT id, student_name, matric_number, level, course_code, file_url, uploaded_at
      FROM assignments
      ORDER BY uploaded_at DESC
    `;
    const result = await client.query(query);
    return NextResponse.json({ results: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}