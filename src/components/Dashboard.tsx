'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUpload, FaUsers, FaFilter, FaCalendar, FaIdCard } from 'react-icons/fa';
import { useAuthContext } from '../app/lib/AuthProvider';
import SkeletonLoader from './SkeletonLoader';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function Dashboard() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [uploads, setUploads] = useState<any[]>([]);
  const [totalUploads, setTotalUploads] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ matricNumber: '', date: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(filters.matricNumber && { matricNumber: filters.matricNumber }),
          ...(filters.date && { date: filters.date }),
        });
        const res = await fetch(`/api/assignments?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUploads(data.assignments);
        setTotalPages(data.pages);
        setTotalUploads(data.total);

        if (user?.role === 'admin') {
          const usersRes = await fetch('/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const usersData = await usersRes.json();
          setTotalUsers(usersData.users.length);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, filters, user?.role]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div className="min-h-screen p-6 mt-16 bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto w-full"
      >
        <h1 className="text-3xl font-bold mb-8 text-white">
          Dashboard
        </h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/dashboard/uploads')}
            className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl cursor-pointer text-white"
          >
            {loading ? (
              <SkeletonLoader type="card" />
            ) : (
              <>
                <FaUpload className="text-3xl mb-4 text-blue-400 mx-auto" />
                <h3 className="text-xl font-semibold text-white">
                  Total Uploads
                </h3>
                <p className="text-3xl font-bold text-white">
                  {totalUploads}
                </p>
              </>
            )}
          </motion.div>
          {user?.role === 'admin' && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/dashboard/users')}
              className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl cursor-pointer text-white"
            >
              {loading ? (
                <SkeletonLoader type="card" />
              ) : (
                <>
                  <FaUsers className="text-3xl mb-4 text-blue-400 mx-auto" />
                  <h3 className="text-xl font-semibold text-white">
                    Total Users
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {totalUsers}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Recent Uploads Table */}
        <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl">
          <div className="flex items-center mb-4">
            <FaFilter className="mr-2 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Recent Uploads
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex items-center">
              <FaIdCard className="mr-2 text-blue-400" />
              <input
                type="text"
                name="matricNumber"
                placeholder="Filter by Matric Number"
                value={filters.matricNumber}
                onChange={handleFilterChange}
                className="p-2 rounded-lg bg-white/5 border-white/20 text-white"
              />
            </div>
            <div className="flex items-center">
              <FaCalendar className="mr-2 text-blue-400" />
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="p-2 rounded-lg bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-white/80">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Matric Number</th>
                  <th className="p-3">Course Code</th>
                  <th className="p-3">Level</th>
                  <th className="p-3">Upload Date</th>
                  <th className="p-3">File</th>
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
                      <td className="p-3 text-white">{upload.student_name}</td>
                      <td className="p-3 text-white">{upload.matric_number}</td>
                      <td className="p-3 text-white">{upload.course_code}</td>
                      <td className="p-3 text-white">{upload.level}</td>
                      <td className="p-3 text-white">{new Date(upload.uploaded_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <a href={upload.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          View File
                        </a>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-4">
            <motion.button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-lg transition-colors disabled:opacity-50"
            >
              Previous
            </motion.button>
            <span className="text-white/80">
              Page {page} of {totalPages}
            </span>
            <motion.button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-lg transition-colors disabled:opacity-50"
            >
              Next
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}