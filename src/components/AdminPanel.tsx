"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MaterialSymbolsDownloadSharp } from "./icons/download-sharp";
import { MaterialSymbolsVisibilityOutlineRounded } from "./icons/preview";
import PreviewDocument from "./PreviewDocument";

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
	student_name: string;
	id: number;
	matric_number: string;
	level: string;
	course_code: string;
	file_url: string;
}

export default function AdminPanel() {
	const [submissions, setSubmissions] = useState<ISubmission[]>([]);
	const [currentPreview, setCurrentPreview] = useState<string>("");
	const [showPreview, setShowPreview] = useState<boolean>(false);
	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/getAssignment");
				const submissions = await res.json();
				if (res.ok) {
					setSubmissions(submissions.results);
				} else {
					// console.error("Failed to fetch submissions:", submissions.error);
				}
			} catch (error) {
				console.error("Error in AdminPanel:", error);
			}
		})();
	}, []);

	async function downloadFile(submission: ISubmission) {
		const file = await fetch(submission.file_url);

		if (!file.ok) {
			console.log("Failed to download file.");
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
	}

	const handlePreview = (submission: ISubmission) => {
		setCurrentPreview(submission.file_url);
		setShowPreview(true);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
			<motion.div>
				<motion.table className="w-[800px]">
					<motion.thead className="border-b-2 border-gray-300">
						<motion.tr>
							<motion.th className="text-start ps-4 uppercase">
								Student Name
							</motion.th>
							<motion.th className="text-start uppercase">
								Matric Number
							</motion.th>
							<motion.th className="text-start uppercase">Actions</motion.th>
						</motion.tr>
					</motion.thead>
					<motion.tbody>
						{submissions.map((submission) => (
							<motion.tr
								variants={itemVariants}
								initial="hidden"
								animate="visible"
								className="border-b border-gray-100"
							>
								<td className="py-4 ps-4">
									{/* {submission.student_name.toUpperCase()} */}
								</td>
								<td className="py-4">
									{submission.matric_number.toUpperCase()}
								</td>
								<td className="py-4 flex gap-6">
									<button
										onClick={() => handlePreview(submission)}
										className="before:content-['Preview'] hover:before:opacity-100 before:absolute before:opacity-0 before:bg-gray-200 before:text-black before:translate-y-full before:p-2 before:text-xs befor:duration-300 before:rounded "
									>
										<MaterialSymbolsVisibilityOutlineRounded className="text-2xl" />
										<span className="sr-only">Preview</span>
									</button>
									<button
										onClick={() => downloadFile(submission)}
										className="before:content-['Download'] hover:before:opacity-100 before:absolute before:opacity-0 before:bg-gray-200 before:text-black before:translate-y-full before:p-2 before:text-xs befor:duration-300 before:rounded "
									>
										<MaterialSymbolsDownloadSharp className="text-2xl" />
										<span className="sr-only">Download</span>
									</button>
								</td>
							</motion.tr>
						))}
					</motion.tbody>
				</motion.table>
			</motion.div>
			{showPreview && (
				<PreviewDocument
					documentUrl={currentPreview}
					setShow={setShowPreview}
				/>
			)}
		</div>
	);
}
