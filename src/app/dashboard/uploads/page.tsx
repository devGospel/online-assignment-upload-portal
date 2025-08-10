'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaCalendar, FaIdCard, FaUser, FaDownload, FaTimes, FaRedo } from 'react-icons/fa';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { useUploads } from '../../../hooks/useUploads';

interface ISubmission {
  student_name: string;
  id: number;
  matric_number: string;
  level: string;
  course_code: string;
  file_url: string;
  uploaded_at: string;
}

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Uploads() {
  const [filters, setFilters] = useState({ studentName: '', matricNumber: '', date: '' });
  const [page, setPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<ISubmission | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { uploads, totalPages, loading, error } = useUploads(filters, page);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ studentName: '', matricNumber: '', date: '' });
    setPage(1);
  };

  const openFilePreview = async (submission: ISubmission) => {
    setSelectedFile(submission);
    setFileLoading(true);
    setFileError(null);
    setPreviewUrl(null);

    console.log('Attempting to fetch file:', { fileUrl: submission.file_url, token: localStorage.getItem('token') });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(submission.file_url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetch response:', { status: response.status, statusText: response.statusText });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log('Generated blob URL:', blobUrl);
      setPreviewUrl(blobUrl);
    } catch (error) {
      console.error('Error fetching preview URL:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to load file preview.');
      setFileLoading(false);
    }
  };

  const closeFilePreview = () => {
    if (previewUrl) {
      console.log('Revoking blob URL:', previewUrl);
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setFileLoading(false);
    setFileError(null);
    setPreviewUrl(null);
  };

  const handleFileLoad = () => {
    console.log('Iframe loaded successfully');
    setFileLoading(false);
  };

  const handleFileError = () => {
    console.error('Iframe failed to load');
    setFileLoading(false);
    setFileError('Failed to load the file in the viewer. Please try downloading it.');
  };

  async function downloadFile(submission: ISubmission) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Downloading file:', { fileUrl: submission.file_url });
      const file = await fetch(submission.file_url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!file.ok) {
        throw new Error(`Failed to download file: ${file.status} ${file.statusText}`);
      }
      const data = await file.blob();
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${submission.matric_number.replaceAll(
        '/',
        '-'
      )}_${submission.student_name.replaceAll(' ', '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to download file.');
    }
  }

  // Timeout for file loading
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (fileLoading) {
      timeout = setTimeout(() => {
        if (fileLoading) {
          console.error('File loading timed out');
          setFileLoading(false);
          setFileError('File loading timed out. Please try downloading instead.');
        }
      }, 10000); // 10 seconds timeout
    }
    return () => clearTimeout(timeout);
  }, [fileLoading]);

  return (
    <div className="min-h-screen p-4 sm:p-6 mt-16 bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto w-full"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">
          All Uploads
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500 text-white rounded-lg text-sm sm:text-base">
            <p>Error fetching uploads: {error}</p>
          </div>
        )}

        {!loading && uploads.length === 0 && (
          <div className="mb-6 p-3 bg-yellow-500/20 border border-yellow-500 text-white rounded-lg text-sm sm:text-base">
            <p>No uploads found matching your filters.</p>
          </div>
        )}

        <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaFilter className="mr-2 text-blue-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Filter Uploads
              </h2>
            </div>
            <button
              onClick={resetFilters}
              className="flex items-center px-3 py-1 bg-gray-600 text-white hover:bg-gray-700 rounded-lg text-sm sm:text-base"
            >
              <FaRedo className="mr-1" /> Reset
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 mb-4">
            <div className="flex items-center">
              <FaUser className="mr-2 text-blue-400" />
              <input
                type="text"
                name="studentName"
                placeholder="Student Name"
                value={filters.studentName}
                onChange={handleFilterChange}
                className="p-2 rounded-lg bg-white/5 border-white/20 text-white text-sm sm:text-base w-full"
              />
            </div>
            <div className="flex items-center">
              <FaIdCard className="mr-2 text-blue-400" />
              <input
                type="text"
                name="matricNumber"
                placeholder="Matric Number"
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

          {/* Desktop: Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-white/80">
                  <th className="p-3 text-sm sm:text-base">Student Name</th>
                  <th className="p-3 text-sm sm:text-base">Matric Number</th>
                  <th className="p-3 text-sm sm:text-base">Course Code</th>
                  <th className="p-3 text-sm sm:text-base">Level</th>
                  <th className="p-3 text-sm sm:text-base">Upload Date/Time</th>
                  <th className="p-3 text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6}><SkeletonLoader type="table-row" /></td>
                    </tr>
                  ))
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
                      <td className="p-3 text-white text-sm sm:text-base text-center">
                        {new Date(upload.uploaded_at).toLocaleDateString()}
                        <br />
                        {new Date(upload.uploaded_at).toLocaleTimeString()}
                      </td>
                      <td className="p-3 flex space-x-3">
                        <button
                          onClick={() => openFilePreview(upload)}
                          className="text-blue-400 hover:text-blue-300 text-sm sm:text-base"
                          title="Preview File"
                        >
                          View
                        </button>
                        <button
                          onClick={() => downloadFile(upload)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Download File"
                        >
                          <FaDownload className="text-base sm:text-lg" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile: Card View */}
          <div className="block sm:hidden space-y-4">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <SkeletonLoader key={i} type="card" />
              ))
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
                    <p><strong>Date:</strong> {new Date(upload.uploaded_at).toLocaleDateString()} {new Date(upload.uploaded_at).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex space-x-4 mt-3">
                    <button
                      onClick={() => openFilePreview(upload)}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                      title="Preview File"
                    >
                      <FaUser className="mr-1" /> View
                    </button>
                    <button
                      onClick={() => downloadFile(upload)}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                      title="Download File"
                    >
                      <FaDownload className="mr-1" /> Download
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="flex justify-between mt-4 sm:mt-6">
            <motion.button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
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
              disabled={page === totalPages}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              Next
            </motion.button>
          </div>
        </div>

        {selectedFile && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 w-full max-w-full sm:max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
                  Preview: {selectedFile.student_name}'s Assignment
                </h2>
                <div className="flex space-x-3 sm:space-x-4">
                  <button
                    onClick={() => downloadFile(selectedFile)}
                    className="text-blue-400 hover:text-blue-300 flex items-center text-sm sm:text-base"
                  >
                    <FaDownload className="mr-1" /> Download
                  </button>
                  <button
                    onClick={closeFilePreview}
                    className="text-red-400 hover:text-red-300 text-base sm:text-lg"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              {fileError && (
                <div className="mb-3 sm:mb-4 p-2 bg-red-500/20 border border-red-500 text-white rounded-lg text-sm sm:text-base">
                  {fileError}
                  <button
                    onClick={() => downloadFile(selectedFile)}
                    className="ml-2 text-blue-400 hover:text-blue-300 underline"
                  >
                    Try downloading instead
                  </button>
                </div>
              )}
              {fileLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <SkeletonLoader type="card" />
                </div>
              )}
              {!fileLoading && !fileError && previewUrl && (
                <iframe
                  src={previewUrl}
                  className="flex-1 w-full h-full rounded-lg"
                  onLoad={handleFileLoad}
                  onError={handleFileError}
                  title="File Preview"
                />
              )}
              {!fileLoading && !fileError && !previewUrl && (
                <div className="flex-1 flex items-center justify-center text-white text-sm sm:text-base">
                  <p>Unable to generate preview. Please try downloading the file.</p>
                  <button
                    onClick={() => downloadFile(selectedFile)}
                    className="ml-2 text-blue-400 hover:text-blue-300 underline"
                  >
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}