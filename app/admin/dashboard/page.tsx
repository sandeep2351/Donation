'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check' }),
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      const r = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      if (!r.ok) throw new Error('logout failed');
      toast({ title: 'Signed out', description: 'Taking you to the home page.', duration: 4000 });
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      toast({
        title: 'Sign out failed',
        description: 'Try again or close the browser.',
        variant: 'destructive',
        duration: 6000,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'donations', label: 'Donations' },
    { id: 'qr-codes', label: 'QR & PayPal' },
    { id: 'medical', label: 'Medical Reports' },
    { id: 'news', label: 'News' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      {/* Header */}
      <header className="z-40 shrink-0 border-b border-gray-200 bg-white/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-14 sm:h-16 py-1 sm:py-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2.5 text-gray-700 hover:bg-gray-100 rounded-lg min-h-11 min-w-11 flex items-center justify-center"
                aria-expanded={mobileMenuOpen}
                aria-controls="admin-mobile-nav"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              id="admin-mobile-nav"
              className="sm:hidden pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-gray-200 pt-2"
            >
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              <button
                onClick={handleLogout}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1">
        <aside className="hidden h-full w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-white sm:block">
          <nav className="space-y-1 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full rounded-lg border-l-4 px-4 py-3 text-left font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-transparent text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-auto p-3 sm:p-6 lg:p-8 pb-[max(1rem,env(safe-area-inset-bottom,0px)+0.75rem)]">
          <AdminDashboardClient activeTab={activeTab} />
        </main>
      </div>
    </div>
  );
}
