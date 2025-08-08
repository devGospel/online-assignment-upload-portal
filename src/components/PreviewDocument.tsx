import { motion } from "framer-motion";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export default function PreviewDocument({
	documentUrl,
	setShow,
}: {
	documentUrl: string;
	setShow: Dispatch<SetStateAction<boolean>>;
}) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const displayPreview = async () => {
			const file = await fetch(documentUrl);

			if (!file.ok) {
				console.log("Failed to get document.");
			}

			const data = await file.blob();
			const url = URL.createObjectURL(data);
			iframeRef.current!.src = `${url}.pdf`;
		};
		if (documentUrl) {
			displayPreview();
		}

		// return () => {
		// 	if (iframeRef.current) {
		// 		iframeRef.current.src = "";
		// 	}
		// };
	}, []);
	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50`}
		>
			<div className="bg-white p-4 rounded shadow-lg">
				<h2 className="text-xl font-bold mb-4">Preview Document</h2>
				<motion.div>
					<iframe
						src={`${documentUrl}`}
						className="w-full h-full"
						ref={iframeRef}
					></iframe>
				</motion.div>
				<button
					className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					onClick={() => setShow(false)}
				>
					Close
				</button>
			</div>
		</div>
	);
}
