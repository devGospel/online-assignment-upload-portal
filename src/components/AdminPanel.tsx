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
  id: number;
  student_name: string;
  matric_number: string;
  level: string;
  course_code: string;
  file_url: string;
}

export default function AdminPanel() {
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [currentPreview, setCurrentPreview] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/getAssignment");
        const data = await res.json();
        if (res.ok) {
          setSubmissions(data.results);
        } else {
          console.error("Failed to fetch submissions:", data.error);
          setErrorMessage(data.error || "Failed to fetch submissions");
        }
      } catch (error) {
        console.error("Error in AdminPanel:", error);
        setErrorMessage("Error fetching submissions");
      }
    })();
  }, []);

  async function downloadFile(submission: ISubmission) {
    try {
      console.log('Attempting to download file from:', submission.file_url); // Debug log
      const response = await fetch(submission.file_url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${submission.matric_number.replaceAll(
        "/",
        "-"
      )}_${submission.student_name.replaceAll(" ", "_").toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setErrorMessage("");
    } catch (error) {
      console.error('Error downloading file:', error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to download file");
    }
  }

  const handlePreview = (submission: ISubmission) => {
    setCurrentPreview(submission.file_url);
    setShowPreview(true);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-lg text-center text-white bg-red-500/20"
        >
          {errorMessage}
        </motion.div>
      )}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.table className="w-[800px] text-white">
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
                key={submission.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="border-b border-gray-100"
              >
                <td className="py-4 ps-4">
                  {submission.student_name.toUpperCase()}
                </td>
                <td className="py-4">
                  {submission.matric_number.toUpperCase()}
                </td>
                <td className="py-4 flex gap-6">
                  <button
                    onClick={() => handlePreview(submission)}
                    className="before:content-['Preview'] hover:before:opacity-100 before:absolute before:opacity-0 before:bg-gray-200 before:text-black before:translate-y-full before:p-2 before:text-xs before:duration-300 before:rounded"
                  >
                    <MaterialSymbolsVisibilityOutlineRounded className="text-2xl" />
                    <span className="sr-only">Preview</span>
                  </button>
                  <button
                    onClick={() => downloadFile(submission)}
                    className="before:content-['Download'] hover:before:opacity-100 before:absolute before:opacity-0 before:bg-gray-200 before:text-black before:translate-y-full before:p-2 before:text-xs before:duration-300 before:rounded"
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