'use client';

import { motion } from 'framer-motion';
import { FaUpload, FaBookOpen, FaUserGraduate } from 'react-icons/fa';
import Link from 'next/link';

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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center mt-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl opacity-50"></div>
              <FaBookOpen className="text-6xl text-white relative z-10" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Streamline Your Assignment Submissions
          </h1>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-4 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto"
        >
          Upload your assignments effortlessly with our secure and user-friendly platform. Designed for students, built for success.
        </motion.p>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="mt-8">
          <Link href="/upload">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              <FaUpload className="mr-2" />
              Upload Now
            </motion.button>
          </Link>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <motion.div
            variants={itemVariants}
            className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl text-white"
          >
            <FaUserGraduate className="text-3xl text-blue-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">Easy to Use</h3>
            <p className="mt-2 text-white/70">
              Submit assignments in just a few clicks with our intuitive interface.
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl text-white"
          >
            <FaBookOpen className="text-3xl text-blue-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">Secure Uploads</h3>
            <p className="mt-2 text-white/70">
              Your files are safe with our encrypted upload system.
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-xl text-white"
          >
            <FaUpload className="text-3xl text-blue-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">Any Format</h3>
            <p className="mt-2 text-white/70">
              Upload PDFs, DOCs, or images with full compatibility.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        variants={itemVariants}
        className="mt-16 text-white/60 text-sm"
      >
        <p>&copy; {new Date().getFullYear()} Assignment Upload App. All rights reserved.</p>
      </motion.footer>
    </div>
  );
}