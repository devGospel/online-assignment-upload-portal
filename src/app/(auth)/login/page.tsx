'use client';

import { motion } from 'framer-motion';
import { FaUser, FaLock, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../lib/AuthProvider';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Google login failed');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center mt-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md mx-auto text-center"
        >
          {/* Login Header */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl opacity-50"></div>
                <FaUser className="text-6xl text-white relative z-10" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Log In to Your Account
            </h1>
            <p className="mt-2 text-white/80">
              Access your assignment upload dashboard
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div variants={itemVariants} className="mt-8 bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80">
                  Password
                </label>
                <div className="mt-1 relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                className="w-full flex justify-center py-3 px-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
              >
                Log In
              </motion.button>

              <div className="flex items-center justify-center my-4">
                <div className="border-t border-white/20 flex-grow"></div>
                <span className="mx-4 text-white/60 text-sm">OR</span>
                <div className="border-t border-white/20 flex-grow"></div>
              </div>

              {/* <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
                theme="filled_blue"
                size="large"
                width="100%"
              /> */}
            </div>

            <div className="mt-6 text-white/60 text-sm">
              <p>
                Don’t have an account?{' '}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                  Sign up
                </Link>
              </p>
              <p className="mt-2">
                <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300">
                  Forgot your password?
                </Link>
              </p>
            </div>
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
    </GoogleOAuthProvider>
  );
}