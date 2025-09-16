import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '../../lib/cloudinary';
import client from '../../lib/db';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    // Parse FormData
    const formData = await req.formData();
    const studentName = formData.get('studentName')?.toString() || '';
    const matricNumber = formData.get('matricNumber')?.toString() || '';
    const level = formData.get('level')?.toString() || '';
    const courseCode = formData.get('courseCode')?.toString() || '';
    const file = formData.get('file') as File;

    // Validate inputs
    if (!studentName || !matricNumber || !level || !courseCode || !file) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate matric number (≥14 characters)
    if (matricNumber.length < 14) {
      return NextResponse.json(
        { error: 'Matric number must be at least 14 characters' },
        { status: 400 }
      );
    }

    // Validate file type and extension
    const validMimeTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
    ];
    const isValidExtension = file.name.toLowerCase().endsWith('.zip');
    if (!validMimeTypes.includes(file.type) || !isValidExtension) {
      return NextResponse.json(
        { error: 'Only ZIP files with .zip extension are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadPromise = new Promise<NextResponse>((resolve, reject) => {
      const publicId = `assignments/${matricNumber.replace(/\//g, '-')}_${courseCode}_${Date.now()}.zip`;
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: publicId,
          folder: 'assignments',
          // Generate signed URL if required
          // sign_url: true, // Uncomment if signed URLs are enabled in Cloudinary
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error.message);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }

          // Save to database
          const query = `
            INSERT INTO assignments (student_name, matric_number, level, course_code, file_url, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id, student_name, matric_number, level, course_code, file_url, uploaded_at
          `;
          const fileUrl = result?.secure_url || '';
          const values = [studentName, matricNumber, level, courseCode, fileUrl];

          client.query(query, values, (err, dbResult) => {
            if (err) {
              console.error('Database insertion failed:', err);
              return reject(new Error('Database insertion failed'));
            }
            resolve(
              NextResponse.json({
                message: 'ZIP file uploaded successfully',
                data: dbResult.rows[0],
              })
            );
          });
        }
      );

      // Stream the file to Cloudinary
      const readable = Readable.from(buffer);
      readable.pipe(uploadStream);
    });

    return await uploadPromise;
  } catch (error) {
    console.error('Error in file upload process:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Something went wrong!',
      },
      { status: 500 }
    );
  }
}