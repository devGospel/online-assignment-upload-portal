// app/api/uploadAssignment/route.ts
import cloudinary from '../../lib/cloudinary';
import client from '../../lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    // Ensure FormData is parsed correctly
    const formData = await req.formData();
    const studentName = formData.get('studentName')?.toString() || '';
    const matricNumber = formData.get('matricNumber')?.toString() || '';
    const level = formData.get('level')?.toString() || '';
    const courseCode = formData.get('courseCode')?.toString() || '';
    const file = formData.get('file') as Blob;

    // Handle empty or missing file
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file (Blob) to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a promise to return response after the upload and DB insertion
    const uploadPromise = new Promise<NextResponse>((resolve, reject) => {
      // Upload file to Cloudinary
      const result = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error.message);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }

          // Save metadata to NeonDB
          const query = `
            INSERT INTO assignments (student_name, matric_number, level, course_code, file_url)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
          `;
          const values = [studentName, matricNumber, level, courseCode, result?.secure_url];

          // Insert metadata into the database
          client.query(query, values, (err, dbResult) => {
            if (err) {
              console.error('Database insertion failed:', err);
              return reject(new Error('Database insertion failed'));
            }
            // Respond with success and metadata
            resolve(NextResponse.json({
              message: 'File uploaded successfully',
              data: dbResult.rows[0],
            }));
          });
        }
      );

      // Stream the file to Cloudinary
      const readable = Readable.from(buffer);
      readable.pipe(result);
    });

    // Wait for the upload promise to resolve and return the response
    return await uploadPromise;
  } catch (error) {
    console.error('Error in file upload process:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong!' }, { status: 500 });
  }
}
