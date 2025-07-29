'use client';

import { motion } from 'framer-motion';
import { FaBookOpen, FaUserShield, FaSignOutAlt, FaHome, FaUpload } from 'react-icons/fa';
import Link from 'next/link';
import { useAuthContext } from '../app/lib/AuthProvider';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

const headerVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
};

const Header: React.FC = () => {
  const { user, logout } = useAuthContext();

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/10 backdrop-blur-md border-b border-white/20 fixed top-0 left-0 right-0 z-[100]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <FaBookOpen className="text-2xl text-white" />
          <h1 className="text-xl font-bold text-white">Maestro</h1>
        </div>
        <nav className="flex items-center space-x-4 sm:space-x-6">
          <Link href="/" className="text-white/80 hover:text-white text-sm font-medium flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <FaHome className="mr-1" />
              Home
            </motion.div>
          </Link>
          <Link href="/upload" className="text-white/80 hover:text-white text-sm font-medium flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <FaUpload className="mr-1" />
              Upload
            </motion.div>
          </Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className="text-white/80 hover:text-white text-sm font-medium flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                <FaUserShield className="mr-1" />
                Admin Panel
              </motion.div>
            </Link>
          )}
          {user ? (
            <>
              <span className="text-white/80 text-sm font-medium hidden sm:inline-flex items-center">
                {user.fullName || 'Guest'}
              </span>
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white/80 hover:text-white text-sm font-medium flex items-center"
              >
                <FaSignOutAlt className="mr-1" />
                Logout
              </motion.button>
            </>
          ) : (
            <Link href="/login" className="text-white/80 hover:text-white text-sm font-medium">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.div>
            </Link>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;