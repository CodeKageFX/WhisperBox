"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import EncryptedBadge from '@/components/EncryptedBadge';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[220px] bg-primary/10 -z-10" />
      
      <div className="w-full max-w-[450px] bg-sidebar-bg p-10 rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary border-2 border-sidebar-bg rounded-full animate-pulse-slow shadow-sm" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mt-6 tracking-tight">WhisperBox</h1>
          <p className="text-text-secondary mt-1 text-sm font-medium">Welcome back, securely.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary ml-1" htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full bg-input-bg text-text-primary border-none rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-text-secondary/50 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-text-secondary" htmlFor="password">Password</label>
              <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot?</a>
            </div>
            <input 
              id="password"
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-input-bg text-text-primary border-none rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-text-secondary/50 outline-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-6">
          <p className="text-text-secondary text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline font-semibold decoration-2 underline-offset-4">
              Register
            </Link>
          </p>
          
          <EncryptedBadge className="opacity-60" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
