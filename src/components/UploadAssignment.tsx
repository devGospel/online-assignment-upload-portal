"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUpload,
  FaUser,
  FaIdCard,
  FaGraduationCap,
  FaBook,
} from "react-icons/fa";
import Header from "./Header";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function UploadAssignment() {
  const [file, setFile] = useState<File | null>(null);
  const [studentName, setStudentName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [level, setLevel] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('Selected file MIME type:', selectedFile.type); // Debug log
      const validMimeTypes = [
        "application/zip",
        "application/x-zip-compressed",
        "application/octet-stream",
      ];
      const isValidExtension = selectedFile.name.toLowerCase().endsWith(".zip");
      if (!validMimeTypes.includes(selectedFile.type) || !isValidExtension) {
        setMessage("Please select a valid ZIP file (e.g., .zip extension)");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a ZIP file");
      return;
    }

    setIsUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("studentName", studentName);
    formData.append("matricNumber", matricNumber);
    formData.append("level", level);
    formData.append("courseCode", courseCode);
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploadAssignment", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("ZIP file uploaded successfully!");
        setFile(null);
        setStudentName("");
        setMatricNumber("");
        setLevel("");
        setCourseCode("");
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Failed to upload ZIP file.");
    }

    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center mt-16 px-4 sm:px-6 lg:px-8">
      <Header />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-lg w-full mx-auto p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl"
      >
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-white mb-6 text-center"
        >
          Upload Your Assignment
        </motion.h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={itemVariants} className="relative">
            <label className="block text-sm font-medium text-white/80 mb-2">
              <FaUser className="inline mr-2 text-blue-400" />
              Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-white/50"
              placeholder="Enter your full name"
              required
            />
          </motion.div>
          <motion.div variants={itemVariants} className="relative">
            <label className="block text-sm font-medium text-white/80 mb-2">
              <FaIdCard className="inline mr-2 text-blue-400" />
              Matric Number
            </label>
            <input
              type="text"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-white/50"
              placeholder="Enter your matric number"
              required
            />
          </motion.div>
          <motion.div variants={itemVariants} className="relative">
            <label className="block text-sm font-medium text-white/80 mb-2">
              <FaGraduationCap className="inline mr-2 text-blue-400" />
              Level
            </label>
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-white/50"
              placeholder="Enter your level (e.g., 100)"
              required
            />
          </motion.div>
          <motion.div variants={itemVariants} className="relative">
            <label className="block text-sm font-medium text-white/80 mb-2">
              <FaBook className="inline mr-2 text-blue-400" />
              Course Code
            </label>
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-white/50"
              placeholder="Enter course code (e.g., CSC101)"
              required
            />
          </motion.div>
          <motion.div variants={itemVariants} className="relative">
            <label className="block text-sm font-medium text-white/80 mb-2">
              <FaUpload className="inline mr-2 text-blue-400" />
              Upload Assignment (ZIP)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-white file:hover:bg-blue-500/30"
              required
              accept="application/zip,application/x-zip-compressed,application/octet-stream"
            />
          </motion.div>
          <motion.button
            type="submit"
            disabled={isUploading}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <FaUpload className="mr-2" />
            )}
            {isUploading ? "Uploading..." : "Upload Assignment"}
          </motion.button>
        </form>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mt-4 p-4 rounded-lg text-center text-white ${
              message.includes("successfully")
                ? "bg-green-500/20"
                : "bg-red-500/20"
            }`}
          >
            {message}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}