import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      studentName,
      matricNumber,
      level,
      course,
      fileUrl,
      fileFormat,
      publicId,
    } = await request.json();

    // Validate input
    if (!studentName || !matricNumber || !level || !course || !fileUrl || !fileFormat || !publicId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Insert data into Neon database
    await sql`
      INSERT INTO assignments (student_name, matric_number, level, course, file_url, file_format, public_id)
      VALUES (${studentName}, ${matricNumber}, ${level}, ${course}, ${fileUrl}, ${fileFormat}, ${publicId})
    `;

    return NextResponse.json({ message: "Data saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}