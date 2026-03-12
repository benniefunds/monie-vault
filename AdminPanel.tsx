import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Sun, Moon, Users, ListTodo, Shield, Wallet, LogOut,
  ChevronRight, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminPanel() {
  const { 
    isAdmin, logout, navigateTo, darkMode, toggleDarkMode,
    users, getPendingKYC, getPendingSubmissions, getPendingWithdrawals,
    dailyPoolRemaining, setLoading
  } = useAppState();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-sm">
          <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-4">You must be logged in as admin to view this page.</p>
          <Button onClick={() => navigateTo('landing')} className="w-full">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const pendingKYC = getPendingKYC();
  const pendingSubmissions = getPendingSubmissions();
  const pendingWithdrawals = getPendingWithdrawals();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    logout();
    toast.success('Logged out successfully');
    setIsLoggingOut(false);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg">Monie Vault</span>
            <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold">{users.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Pool Remaining</span>
            </div>
            <p className="text-2xl font-bold">{dailyPoolRemaining.toLocaleString()}</p>
          </Card>
        </div>

        {/* Pending Items */}
        <h2 className="font-semibold mb-3">Pending Approvals</h2>
        <div className="space-y-2 mb-6">
          <button 
            onClick={() => navigateTo('admin-kyc')}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">KYC Verifications</h3>
                <p className="text-xs text-muted-foreground">Verify user identities</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pendingKYC.length > 0 && (
                <Badge variant="destructive">{pendingKYC.length}</Badge>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>

          <button 
            onClick={() => navigateTo('admin-tasks')}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ListTodo className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Task Submissions</h3>
                <p className="text-xs text-muted-foreground">Review completed tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pendingSubmissions.length > 0 && (
                <Badge variant="destructive">{pendingSubmissions.length}</Badge>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>

          <button 
            onClick={() => navigateTo('admin-withdrawals')}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Withdrawals</h3>
                <p className="text-xs text-muted-foreground">Approve payouts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pendingWithdrawals.length > 0 && (
                <Badge variant="destructive">{pendingWithdrawals.length}</Badge>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>
        </div>

        {/* Management */}
        <h2 className="font-semibold mb-3">Management</h2>
        <div className="space-y-2 mb-6">
          <button 
            onClick={() => navigateTo('admin-users')}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">All Users</h3>
                <p className="text-xs text-muted-foreground">View and manage users</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button 
            onClick={() => navigateTo('admin-tasks')}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <ListTodo className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Manage Tasks</h3>
                <p className="text-xs text-muted-foreground">Add or remove tasks</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Sign Out */}
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5 mr-2" />
          )}
          Sign Out
        </Button>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
          Built by{' '}
          <a 
            href="https://t.me/godsgrace003" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Btech
          </a>
        </p>
      </footer>
    </div>
  );
}
