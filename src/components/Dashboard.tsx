"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaUpload,
  FaUsers,
  FaFilter,
  FaCalendar,
  FaIdCard,
  FaUser,
} from "react-icons/fa";
import { useAuthContext } from "../app/lib/AuthProvider";
import SkeletonLoader from "./SkeletonLoader";
import { MaterialSymbolsDownloadSharp } from "./icons/download-sharp";
import { useAssignments } from "../hooks/useAssignments";
import { useUsers } from "../hooks/useUsers";

interface ISubmission {
  student_name: string;
  id: number;
  matric_number: string;
  level: string;
  course_code: string;
  file_url: string;
  uploaded_at: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [filters, setFilters] = useState({ 
    studentName: "", 
    matricNumber: "", 
    date: "" 
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        setIsAdmin(user.role === "admin");
      }
    }
  }, [user, authLoading, router]);

  const { 
    uploads, 
    totalUploads, 
    totalPages, 
    loading: assignmentsLoading,
    error: assignmentsError 
  } = useAssignments(filters, page, user?.role);
  
  const { 
    totalUsers, 
    loading: usersLoading,
    error: usersError 
  } = useUsers(user?.role);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  async function downloadFile(submission: ISubmission) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(submission.file_url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${submission.matric_number.replace("/", "-")}_${
        submission.student_name.replace(" ", "_").toLowerCase()
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      router.push('/login');
    }
  }

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? dateString 
      : date.toLocaleString();
  };

  const isMatricNumberValid = filters.matricNumber.length >= 15;

  if (authLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 mt-16 bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center">
        <SkeletonLoader type="card" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 mt-16 bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto w-full"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">Dashboard</h1>

        {/* Analytics Cards - Only for Admin */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push("/dashboard/uploads")}
              className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl cursor-pointer text-white"
            >
              {assignmentsLoading ? (
                <SkeletonLoader type="card" />
              ) : assignmentsError ? (
                <div className="text-red-400">Error loading data</div>
              ) : (
                <>
                  <FaUpload className="text-3xl mb-4 text-blue-400 mx-auto" />
                  <h3 className="text-xl font-semibold text-white">Total Uploads</h3>
                  <p className="text-3xl font-bold text-white">{totalUploads}</p>
                </>
              )}
            </motion.div>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push("/dashboard/users")}
              className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl cursor-pointer text-white"
            >
              {usersLoading ? (
                <SkeletonLoader type="card" />
              ) : usersError ? (
                <div className="text-red-400">Error loading data</div>
              ) : (
                <>
                  <FaUsers className="text-3xl mb-4 text-blue-400 mx-auto" />
                  <h3 className="text-xl font-semibold text-white">Total Users</h3>
                  <p className="text-3xl font-bold text-white">{totalUsers}</p>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Recent Uploads Section */}
        <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl">
          <div className="flex items-center mb-4">
            <FaFilter className="mr-2 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">Recent Uploads</h2>
          </div>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {isAdmin && (
              <div className="flex items-center">
                <FaUser className="mr-2 text-blue-400" />
                <input
                  type="text"
                  name="studentName"
                  placeholder="Filter by Student Name"
                  value={filters.studentName}
                  onChange={handleFilterChange}
                  className="p-2 rounded-lg bg-white/5 border-white/20 text-white text-sm sm:text-base w-full"
                />
              </div>
            )}
            <div className="flex items-center">
              <FaIdCard className="mr-2 text-blue-400" />
              <input
                type="text"
                name="matricNumber"
                placeholder="Filter by Matric Number (e.g., 2019/1/728338CT)"
                value={filters.matricNumber}
                onChange={handleFilterChange}
                className="p-2 rounded-lg bg-white/5 border-white/20 text-white text-sm sm:text-base w-full"
              />
            </div>
            <div className="flex items-center">
              <FaCalendar className="mr-2 text-blue-400" />
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="p-2 rounded-lg bg-white/5 border-white/20 text-white text-sm sm:text-base w-full"
              />
            </div>
          </div>

          {/* Error Message */}
          {assignmentsError && (
            <div className="p-4 bg-red-500/20 rounded-lg text-white text-sm sm:text-base mb-4">
              <p>Error loading uploads: {assignmentsError.message}</p>
            </div>
          )}

          {!isAdmin && !isMatricNumberValid ? (
            <div className="p-4 bg-yellow-500/20 rounded-lg text-white text-sm sm:text-base">
              <p>Please enter a valid matric number (at least 15 characters, e.g., 2019/1/728338CT) to view your upload history.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-white/80">
                      <th className="p-3 text-sm sm:text-base">Student Name</th>
                      <th className="p-3 text-sm sm:text-base">Matric Number</th>
                      <th className="p-3 text-sm sm:text-base">Course Code</th>
                      <th className="p-3 text-sm sm:text-base">Level</th>
                      <th className="p-3 text-sm sm:text-base">Upload Date/Time</th>
                      <th className="p-3 text-sm sm:text-base">File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentsLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={6}>
                            <SkeletonLoader type="table-row" />
                          </td>
                        </tr>
                      ))
                    ) : uploads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-white">
                          {assignmentsError ? "Error loading data" : "No uploads found"}
                        </td>
                      </tr>
                    ) : (
                      uploads.map((upload) => (
                        <motion.tr
                          key={upload.id}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          className="border-t border-white/20"
                        >
                          <td className="p-3 text-white text-sm sm:text-base">{upload.student_name}</td>
                          <td className="p-3 text-white text-sm sm:text-base">{upload.matric_number}</td>
                          <td className="p-3 text-white text-sm sm:text-base">{upload.course_code}</td>
                          <td className="p-3 text-white text-sm sm:text-base">{upload.level}</td>
                          <td className="p-3 text-white text-center text-sm sm:text-base">
                            {formatDateForDisplay(upload.uploaded_at)}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => downloadFile(upload)}
                              className="text-blue-400 hover:text-blue-300 relative before:content-['Download'] hover:before:opacity-100 before:absolute before:opacity-0 before:bg-gray-200 before:text-black before:translate-y-full before:p-2 before:text-xs before:duration-300 before:rounded"
                            >
                              <MaterialSymbolsDownloadSharp className="text-xl sm:text-2xl" />
                              <span className="sr-only">Download</span>
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-4">
                {assignmentsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <SkeletonLoader key={i} type="card" />
                  ))
                ) : uploads.length === 0 ? (
                  <div className="p-4 text-center text-white">
                    {assignmentsError ? "Error loading data" : "No uploads found"}
                  </div>
                ) : (
                  uploads.map((upload) => (
                    <motion.div
                      key={upload.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="p-4 bg-white/5 rounded-lg shadow-md text-white"
                    >
                      <div className="text-sm">
                        <p><strong>Name:</strong> {upload.student_name}</p>
                        <p><strong>Matric:</strong> {upload.matric_number}</p>
                        <p><strong>Course:</strong> {upload.course_code}</p>
                        <p><strong>Level:</strong> {upload.level}</p>
                        <p><strong>Date:</strong> {formatDateForDisplay(upload.uploaded_at)}</p>
                      </div>
                      <div className="flex space-x-4 mt-3">
                        <button
                          onClick={() => downloadFile(upload)}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                        >
                          <MaterialSymbolsDownloadSharp className="mr-1 text-xl" /> Download
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4 sm:mt-6">
            <motion.button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || assignmentsLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              Previous
            </motion.button>
            <span className="text-white/80 text-sm sm:text-base">
              Page {page} of {totalPages}
            </span>
            <motion.button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || assignmentsLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              Next
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}