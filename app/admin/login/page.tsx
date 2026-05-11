'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorHint, setErrorHint] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorHint('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || 'Authentication failed';
        setError(msg);
        if (typeof data.hint === 'string' && data.hint.length > 0) {
          setErrorHint(data.hint);
        }
        toast({ title: 'Sign in failed', description: msg, variant: 'destructive', duration: 6000 });
        return;
      }

      toast({ title: 'Welcome back', description: 'Loading your dashboard…', duration: 3000 });
      router.push('/admin/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      toast({
        title: 'Sign in failed',
        description: 'Network error. Please try again.',
        variant: 'destructive',
        duration: 6000,
      });
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-1 w-full min-h-0 flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 px-4 py-8 sm:py-12 pb-[max(2.5rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))]">
      <Link
        href="/"
        className="fixed z-20 inline-flex items-center gap-2 rounded-lg border border-gray-200/90 bg-white/95 px-3 py-2.5 text-sm font-medium text-gray-800 shadow-sm backdrop-blur-sm hover:bg-white hover:border-emerald-300/80 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 min-h-11 touch-manipulation left-[max(1rem,env(safe-area-inset-left,0px))] top-[max(1rem,env(safe-area-inset-top,0px))]"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
        Back to home
      </Link>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-5 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 text-sm mt-2">Sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username or email
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username or email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-900"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 space-y-2">
                <p className="font-medium">{error}</p>
                {errorHint && (
                  <p className="text-red-600/90 text-xs leading-relaxed text-pretty">{errorHint}</p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
