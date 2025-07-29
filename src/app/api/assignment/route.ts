import { NextRequest, NextResponse } from 'next/server';
import client from '../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentName = searchParams.get('studentName') || '';
    const matricNumber = searchParams.get('matricNumber') || '';
    const date = searchParams.get('date') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = 'SELECT a.*, u.email, u.full_name FROM assignments a JOIN users u ON a.matric_number = u.matric_number WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (studentName) {
      query += ` AND a.student_name ILIKE $${paramIndex}`;
      values.push(`%${studentName}%`);
      paramIndex++;
    }
    if (matricNumber) {
      query += ` AND a.matric_number ILIKE $${paramIndex}`;
      values.push(`%${matricNumber}%`);
      paramIndex++;
    }
    if (date) {
      query += ` AND DATE(a.uploaded_at) = $${paramIndex}`;
      values.push(date);
      paramIndex++;
    }

    query += ` ORDER BY a.uploaded_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await client.query(query, values);
    const totalResult = await client.query('SELECT COUNT(*) FROM assignments');
    const total = parseInt(totalResult.rows[0].count);

    return NextResponse.json({
      assignments: result.rows,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}