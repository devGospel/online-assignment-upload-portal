import cloudinary from "../../lib/cloudinary";
import client from "../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

export async function GET(req: NextRequest) {
	try {
		const fetchPromise = new Promise<NextResponse>((resolve, reject) => {
			const query = `SELECT * FROM assignments;`;
			client.query(query, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(NextResponse.json({ results: result.rows }, { status: 200 }));
				}
			});
		});

		return await fetchPromise;
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to fetch assignments" },
			{ status: 500 }
		);
	}
}
