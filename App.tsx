import { AppProvider, useAppState } from '@/hooks/useAppState';
import { LandingPage } from '@/sections/LandingPage';
import { LoginPage } from '@/sections/LoginPage';
import { SignupPage } from '@/sections/SignupPage';
import { Dashboard } from '@/sections/Dashboard';
import { TasksPage } from '@/sections/TasksPage';
import { WalletPage } from '@/sections/WalletPage';
import { ProfilePage } from '@/sections/ProfilePage';
import { AdminPanel } from '@/sections/AdminPanel';
import { AdminUsers } from '@/sections/AdminUsers';
import { AdminTasks } from '@/sections/AdminTasks';
import { AdminKYC } from '@/sections/AdminKYC';
import { AdminWithdrawals } from '@/sections/AdminWithdrawals';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { currentView, isLoading } = useAppState();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  switch (currentView) {
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginPage />;
    case 'signup':
      return <SignupPage />;
    case 'dashboard':
      return <Dashboard />;
    case 'tasks':
      return <TasksPage />;
    case 'wallet':
      return <WalletPage />;
    case 'profile':
      return <ProfilePage />;
    case 'admin':
      return <AdminPanel />;
    case 'admin-users':
      return <AdminUsers />;
    case 'admin-tasks':
      return <AdminTasks />;
    case 'admin-kyc':
      return <AdminKYC />;
    case 'admin-withdrawals':
      return <AdminWithdrawals />;
    default:
      return <LandingPage />;
  }
}

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <AppContent />
        <Toaster position="top-center" />
      </div>
    </AppProvider>
  );
}

export default App;
