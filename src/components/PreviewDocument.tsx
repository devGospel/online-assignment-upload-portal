"use client";

import { motion } from "framer-motion";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MaterialSymbolsDownloadSharp } from "./icons/download-sharp";

export default function PreviewDocument({
	documentUrl,
	setShow,
}: {
	documentUrl: string;
	setShow: Dispatch<SetStateAction<boolean>>;
}) {
	const [filename, setFilename] = useState("");

	useEffect(() => {
		// Extract filename from documentUrl for display
		const urlParts = documentUrl.split("/");
		setFilename(urlParts[urlParts.length - 1] || "assignment.zip");
	}, [documentUrl]);

	const handleDownload = async () => {
		try {
			const response = await fetch(documentUrl);
			if (!response.ok) {
				console.error("Failed to download file:", response.statusText);
				return;
			}
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error downloading file:", error);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
				className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
			>
				<h2 className="text-xl font-bold mb-4">Preview Document</h2>
				<div className="p-4 bg-gray-100 rounded-lg text-center">
					<p className="text-gray-700 mb-4">
						ZIP files cannot be previewed in the browser. Please download the file to view its contents.
					</p>
					<p className="text-sm text-gray-500 mb-4">File: {filename}</p>
					<button
						onClick={handleDownload}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center mx-auto"
					>
						<MaterialSymbolsDownloadSharp className="mr-2" />
						Download ZIP
					</button>
				</div>
				<button
					className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full"
					onClick={() => setShow(false)}
				>
					Close
				</button>
			</motion.div>
		</div>
	);
}