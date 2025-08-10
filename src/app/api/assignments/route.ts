import { NextRequest, NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const matricNumber = searchParams.get('matricNumber') || '';
    const studentName = searchParams.get('studentName') || '';
    const date = searchParams.get('date') || '';

    const offset = (page - 1) * limit;

    // Build query with optional filters
    let query = 'SELECT * FROM assignments';
    let values: any[] = [];
    let conditions: string[] = [];

    if (matricNumber) {
      conditions.push('matric_number ILIKE $' + (values.length + 1));
      values.push(`%${matricNumber}%`);
    }
    if (studentName) {
      conditions.push('student_name ILIKE $' + (values.length + 1));
      values.push(`%${studentName}%`);
    }
    if (date) {
      conditions.push('DATE(uploaded_at) = $' + (values.length + 1));
      values.push(date);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY uploaded_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    values.push(limit, offset);

    // Log query for debugging
    console.log('Assignments Query:', { query, values });

    // Fetch assignments using pool
    const result = await pool.query(query, values);

    // Fetch total count for pagination
    const countQuery = 'SELECT COUNT(*) FROM assignments' + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '');
    const countResult = await pool.query(countQuery, values.slice(0, values.length - 2));

    const total = parseInt(countResult.rows[0].count);
    const pages = Math.ceil(total / limit);

    // Log result for debugging
    console.log('Assignments Result:', { total: result.rows.length, pages, total });

    return NextResponse.json({
      assignments: result.rows,
      total,
      pages,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}