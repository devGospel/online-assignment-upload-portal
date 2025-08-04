"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../app/lib/AuthProvider";
import { MaterialSymbolsDownloadSharp } from "../icons/download-sharp";
import { MaterialSymbolsVisibilityOutlineRounded } from "../icons/preview";

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.2, delayChildren: 0.3 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface ISubmission {
	id: number;
	student_name: string;
	matric_number: string;
	level: string;
	course_code: string;
	file_url: string;
	uploaded_at: string;
}

export default function AdminPanel() {
	const { user } = useAuthContext();
	const router = useRouter();
	const [submissions, setSubmissions] = useState<ISubmission[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isRedirecting, setIsRedirecting] = useState(false);

	useEffect(() => {
		console.log("Current user:", user);
		console.log("Token:", localStorage.getItem("token"));

		if (!user) {
			setIsRedirecting(true);
			router.push("/login");
			return;
		}

		if (user.role !== "admin") {
			setError("Access denied: Admin role required");
			setLoading(false);
			return;
		}

		const fetchSubmissions = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					throw new Error("No authentication token found");
				}

				const res = await fetch("/api/assignments", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) {
					throw new Error(
						`Failed to fetch submissions: ${res.status} ${res.statusText}`
					);
				}

				const data = await res.json();
				console.log("Submissions response:", data);
				setSubmissions(Array.isArray(data.assignments) ? data.assignments : []);
			} catch (error) {
				console.error("Error fetching submissions:", error);
				setError(
					error instanceof Error ? error.message : "Failed to load submissions"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchSubmissions();
	}, [user, router]);

	async function downloadFile(submission: ISubmission) {
		try {
			const token = localStorage.getItem("token");
			const file = await fetch(submission.file_url, {
				headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			});

			if (!file.ok) {
				throw new Error("Failed to download file");
			}

			const data = await file.blob();
			const url = URL.createObjectURL(data);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${submission.matric_number.replaceAll(
				"/",
				"-"
			)}_${submission.student_name.replaceAll(" ", "_").toLowerCase()}.pdf`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Download error:", error);
			setError("Failed to download file");
		}
	}

	if (isRedirecting) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
				<div className="text-white text-lg">Redirecting to login...</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
				<div className="text-white text-lg">Loading user data...</div>
			</div>
		);
	}

	if (user.role !== "admin") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
				<div className="text-red-500 text-lg">
					Access Denied: Admin privileges required
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-8">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-6xl mx-auto"
			>
				<h1 className="text-3xl font-bold mb-8 text-white">Admin Panel</h1>

				{error && (
					<div className="mb-4 p-4 bg-red-500/20 text-red-400 rounded-lg">
						{error}
					</div>
				)}

				{loading ? (
					<div className="flex justify-center items-center h-64">
						<div className="text-white text-lg">Loading submissions...</div>
					</div>
				) : (
					<div className="overflow-x-auto">
						<motion.table className="w-full">
							<motion.thead className="border-b-2 border-gray-300 text-white">
								<motion.tr>
									<motion.th className="text-start p-4 uppercase">
										Student Name
									</motion.th>
									<motion.th className="text-start p-4 uppercase">
										Matric Number
									</motion.th>
									<motion.th className="text-start p-4 uppercase">
										Course Code
									</motion.th>
									<motion.th className="text-start p-4 uppercase">
										Level
									</motion.th>
									<motion.th className="text-start p-4 uppercase">
										Upload Date
									</motion.th>
									<motion.th className="text-start p-4 uppercase">
										Actions
									</motion.th>
								</motion.tr>
							</motion.thead>
							<motion.tbody>
								{submissions.length > 0 ? (
									submissions.map((submission) => (
										<motion.tr
											key={submission.id}
											variants={itemVariants}
											initial="hidden"
											animate="visible"
											className="border-b border-gray-100 text-white hover:bg-gray-800/50 transition-colors"
										>
											<td className="p-4">
												{submission.student_name.toUpperCase()}
											</td>
											<td className="p-4">
												{submission.matric_number.toUpperCase()}
											</td>
											<td className="p-4">{submission.course_code}</td>
											<td className="p-4">{submission.level}</td>
											<td className="p-4">
												{new Date(submission.uploaded_at).toLocaleDateString()}
											</td>
											<td className="p-4 flex gap-4 items-center">
												<a
													href={submission.file_url}
													target="_blank"
													rel="noopener noreferrer"
													className="relative group p-2 rounded-full hover:bg-gray-700 transition-colors"
													title="Preview"
												>
													<MaterialSymbolsVisibilityOutlineRounded className="text-2xl" />
													<span className="sr-only">Preview</span>
													<span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
														Preview
													</span>
												</a>
												<button
													onClick={() => downloadFile(submission)}
													className="relative group p-2 rounded-full hover:bg-gray-700 transition-colors"
													title="Download"
												>
													<MaterialSymbolsDownloadSharp className="text-2xl" />
													<span className="sr-only">Download</span>
													<span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
														Download
													</span>
												</button>
											</td>
										</motion.tr>
									))
								) : (
									<motion.tr>
										<td colSpan={6} className="p-8 text-white text-center">
											{error ? (
												<div className="text-red-400">{error}</div>
											) : (
												"No submissions found"
											)}
										</td>
									</motion.tr>
								)}
							</motion.tbody>
						</motion.table>
					</div>
				)}
			</motion.div>
		</div>
	);
}
