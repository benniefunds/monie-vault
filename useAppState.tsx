import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Task, TaskSubmission, Withdrawal, View } from '@/types';

// Admin credentials (hardcoded as requested)
const ADMIN_EMAIL = 'admin@btech.com';
const ADMIN_PASSWORD = 'admin123';

interface AppContextType {
  // Auth
  currentUser: User | null;
  isAdmin: boolean;
  login: (username: string, password: string) => boolean | 'banned';
  adminLogin: (email: string, password: string) => boolean;
  signup: (fullName: string, username: string, password: string, referralCode?: string) => boolean | 'device_exists';
  logout: () => void;
  
  // Navigation
  currentView: View;
  navigateTo: (view: View) => void;
  
  // Users
  users: User[];
  getUserById: (id: string) => User | undefined;
  updateUser: (user: User) => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  deleteTask: (taskId: string) => void;
  getActiveTasks: () => Task[];
  
  // Task Submissions
  taskSubmissions: TaskSubmission[];
  submitTask: (taskId: string, proofImageBase64: string) => void;
  approveTaskSubmission: (submissionId: string) => void;
  rejectTaskSubmission: (submissionId: string) => void;
  getUserSubmissions: (userId: string) => TaskSubmission[];
  getPendingSubmissions: () => TaskSubmission[];
  
  // Withdrawals
  withdrawals: Withdrawal[];
  requestWithdrawal: (points: number) => boolean;
  approveWithdrawal: (withdrawalId: string) => void;
  rejectWithdrawal: (withdrawalId: string) => void;
  getPendingWithdrawals: () => Withdrawal[];
  getUserWithdrawals: (userId: string) => Withdrawal[];
  
  // Daily Login
  claimDailyLogin: () => boolean;
  
  // Ads
  watchAd: () => Promise<boolean>;
  getAdsRemaining: () => number;
  
  // KYC
  submitKYC: (fullName: string, photoBase64: string) => void;
  approveKYC: (userId: string) => void;
  rejectKYC: (userId: string) => void;
  getPendingKYC: () => User[];
  
  // Bank Account
  addBankAccount: (accountHolderName: string, bankName: string, accountNumber: string) => boolean;
  
  // Pool
  dailyPoolLimit: number;
  dailyPoolRemaining: number;
  resetDailyPool: () => void;
  
  // Referral
  getReferralCount: (userId: string) => number;
  
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15);
const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Generate device fingerprint for security
const generateDeviceFingerprint = (): string => {
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  const userAgent = navigator.userAgent;
  
  // Create a simple hash from device info
  const fingerprintString = `${screenInfo}-${timezone}-${language}-${platform}-${userAgent}`;
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

const POINTS_PER_REFERRAL = 5000;
const POINTS_PER_AD = 1200;
const DAILY_ADS_LIMIT = 5;
const DAILY_LOGIN_POINTS = 1000;
const MIN_WITHDRAWAL_POINTS = 50000;
const DEFAULT_POOL_LIMIT = 1000000;
const AD_WATCH_DURATION = 15000; // 15 seconds in milliseconds

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<View>('landing');
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const dailyPoolLimit = DEFAULT_POOL_LIMIT;
  const [dailyPoolUsed, setDailyPoolUsed] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPoolResetDate, setLastPoolResetDate] = useState(new Date().toDateString());

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('monievault_users');
    const savedTasks = localStorage.getItem('monievault_tasks');
    const savedSubmissions = localStorage.getItem('monievault_submissions');
    const savedWithdrawals = localStorage.getItem('monievault_withdrawals');
    const savedPoolUsed = localStorage.getItem('monievault_pool_used');
    const savedPoolDate = localStorage.getItem('monievault_pool_date');
    const savedDarkMode = localStorage.getItem('monievault_darkmode');
    const savedCurrentUser = localStorage.getItem('monievault_current_user');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedSubmissions) setTaskSubmissions(JSON.parse(savedSubmissions));
    if (savedWithdrawals) setWithdrawals(JSON.parse(savedWithdrawals));
    if (savedPoolUsed) setDailyPoolUsed(JSON.parse(savedPoolUsed));
    if (savedPoolDate) setLastPoolResetDate(savedPoolDate);
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    if (savedCurrentUser) {
      const user = JSON.parse(savedCurrentUser);
      setCurrentUser(user);
      // Check if it's a new day for daily login
      checkAndResetDailyLogin(user);
    }

    // Check if pool needs reset
    checkAndResetPool();
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('monievault_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('monievault_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('monievault_submissions', JSON.stringify(taskSubmissions));
  }, [taskSubmissions]);

  useEffect(() => {
    localStorage.setItem('monievault_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('monievault_pool_used', JSON.stringify(dailyPoolUsed));
  }, [dailyPoolUsed]);

  useEffect(() => {
    localStorage.setItem('monievault_pool_date', lastPoolResetDate);
  }, [lastPoolResetDate]);

  useEffect(() => {
    localStorage.setItem('monievault_darkmode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('monievault_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('monievault_current_user');
    }
  }, [currentUser]);

  const checkAndResetDailyLogin = (user: User) => {
    const today = new Date().toDateString();
    if (user.lastLoginDate !== today) {
      const updatedUser = { ...user, dailyLoginClaimed: false };
      setCurrentUser(updatedUser);
      updateUser(updatedUser);
    }
  };

  const checkAndResetPool = () => {
    const today = new Date().toDateString();
    if (lastPoolResetDate !== today) {
      setDailyPoolUsed(0);
      setLastPoolResetDate(today);
    }
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
  };

  const login = (username: string, password: string): boolean | 'banned' => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      if (user.isBanned) {
        return 'banned';
      }
      const today = new Date().toDateString();
      const updatedUser = { ...user, lastLoginDate: today };
      setCurrentUser(updatedUser);
      updateUser(updatedUser);
      setIsAdmin(false);
      navigateTo('dashboard');
      return true;
    }
    return false;
  };

  const adminLogin = (email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setCurrentUser(null);
      navigateTo('admin');
      return true;
    }
    return false;
  };

  const signup = (fullName: string, username: string, password: string, referralCode?: string): boolean | 'device_exists' => {
    if (users.some(u => u.username === username)) {
      return false;
    }

    // Check for device fingerprint to prevent multiple accounts
    const deviceFingerprint = generateDeviceFingerprint();
    const existingDeviceUser = users.find(u => u.deviceFingerprint === deviceFingerprint);
    if (existingDeviceUser) {
      return 'device_exists';
    }

    const newUser: User = {
      id: generateId(),
      fullName,
      username,
      password,
      points: 0,
      referralCode: generateReferralCode(),
      createdAt: new Date().toISOString(),
      loginStreak: 0,
      dailyLoginClaimed: false,
      adsWatchedToday: 0,
      lastAdsResetDate: new Date().toDateString(),
      kycStatus: 'not_submitted',
      deviceFingerprint,
    };

    // Handle referral - store referral but don't give points yet
    // Points will be given when referred user completes KYC
    if (referralCode) {
      const referrer = users.find(u => u.referralCode === referralCode);
      if (referrer) {
        newUser.referredBy = referrer.id;
        // Don't give points yet - wait for KYC approval
      }
    }

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAdmin(false);
    navigateTo('dashboard');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    navigateTo('landing');
  };

  const getUserById = (id: string) => users.find(u => u.id === id);

  const updateUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
    }
  };

  const banUser = (userId: string) => {
    const user = getUserById(userId);
    if (user) {
      updateUser({ ...user, isBanned: true });
    }
  };

  const unbanUser = (userId: string) => {
    const user = getUserById(userId);
    if (user) {
      updateUser({ ...user, isBanned: false });
    }
  };

  // Tasks
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const getActiveTasks = () => tasks.filter(t => t.isActive);

  // Task Submissions
  const submitTask = (taskId: string, proofImageBase64: string) => {
    if (!currentUser) return;
    const submission: TaskSubmission = {
      id: generateId(),
      taskId,
      userId: currentUser.id,
      proofImageBase64,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setTaskSubmissions(prev => [...prev, submission]);
  };

  const approveTaskSubmission = (submissionId: string) => {
    const submission = taskSubmissions.find(s => s.id === submissionId);
    if (submission) {
      const task = tasks.find(t => t.id === submission.taskId);
      if (task) {
        const user = getUserById(submission.userId);
        if (user) {
          updateUser({ ...user, points: user.points + task.points });
        }
      }
      setTaskSubmissions(prev => prev.map(s => 
        s.id === submissionId ? { ...s, status: 'approved', reviewedAt: new Date().toISOString() } : s
      ));
    }
  };

  const rejectTaskSubmission = (submissionId: string) => {
    setTaskSubmissions(prev => prev.map(s => 
      s.id === submissionId ? { ...s, status: 'rejected', reviewedAt: new Date().toISOString() } : s
    ));
  };

  const getUserSubmissions = (userId: string) => 
    taskSubmissions.filter(s => s.userId === userId).map(s => ({
      ...s,
      task: tasks.find(t => t.id === s.taskId),
    }));

  const getPendingSubmissions = () => 
    taskSubmissions.filter(s => s.status === 'pending').map(s => ({
      ...s,
      task: tasks.find(t => t.id === s.taskId),
      user: getUserById(s.userId),
    }));

  // Withdrawals
  const requestWithdrawal = (points: number): boolean => {
    if (!currentUser || !currentUser.bankAccount) return false;
    if (points < MIN_WITHDRAWAL_POINTS) return false;
    if (currentUser.points < points) return false;
    if (currentUser.kycStatus !== 'approved') return false;
    if (dailyPoolUsed + points > dailyPoolLimit) return false;

    const withdrawal: Withdrawal = {
      id: generateId(),
      userId: currentUser.id,
      amount: points / 10, // 10 points = 1 naira
      pointsUsed: points,
      bankAccount: currentUser.bankAccount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    setWithdrawals(prev => [...prev, withdrawal]);
    updateUser({ ...currentUser, points: currentUser.points - points });
    setDailyPoolUsed(prev => prev + points);
    return true;
  };

  const approveWithdrawal = (withdrawalId: string) => {
    setWithdrawals(prev => prev.map(w => 
      w.id === withdrawalId ? { ...w, status: 'approved', reviewedAt: new Date().toISOString() } : w
    ));
  };

  const rejectWithdrawal = (withdrawalId: string) => {
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    if (withdrawal) {
      const user = getUserById(withdrawal.userId);
      if (user) {
        updateUser({ ...user, points: user.points + withdrawal.pointsUsed });
      }
      setDailyPoolUsed(prev => prev - withdrawal.pointsUsed);
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId ? { ...w, status: 'rejected', reviewedAt: new Date().toISOString() } : w
      ));
    }
  };

  const getPendingWithdrawals = () => 
    withdrawals.filter(w => w.status === 'pending').map(w => ({
      ...w,
      user: getUserById(w.userId),
    }));

  const getUserWithdrawals = (userId: string) => 
    withdrawals.filter(w => w.userId === userId);

  // Daily Login
  const claimDailyLogin = (): boolean => {
    if (!currentUser || currentUser.dailyLoginClaimed) return false;

    const today = new Date().toDateString();
    const lastLogin = currentUser.lastLoginDate;
    let newStreak = currentUser.loginStreak;

    if (lastLogin) {
      const lastDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const bonusPoints = Math.min(newStreak * 10, 100); // Max 100 bonus
    const totalPoints = DAILY_LOGIN_POINTS + bonusPoints;

    const updatedUser = {
      ...currentUser,
      points: currentUser.points + totalPoints,
      loginStreak: newStreak,
      dailyLoginClaimed: true,
      lastLoginDate: today,
    };

    updateUser(updatedUser);
    return true;
  };

  // Ads
  const watchAd = async (): Promise<boolean> => {
    if (!currentUser) return false;
    
    const today = new Date().toDateString();
    if (currentUser.lastAdsResetDate !== today) {
      const updatedUser = { ...currentUser, adsWatchedToday: 0, lastAdsResetDate: today };
      updateUser(updatedUser);
    }

    if (currentUser.adsWatchedToday >= DAILY_ADS_LIMIT) return false;

    // Wait for 15 seconds (simulating ad watch time)
    await new Promise(resolve => setTimeout(resolve, AD_WATCH_DURATION));

    const updatedUser = {
      ...currentUser,
      points: currentUser.points + POINTS_PER_AD,
      adsWatchedToday: currentUser.adsWatchedToday + 1,
    };

    updateUser(updatedUser);
    return true;
  };

  const getAdsRemaining = () => {
    if (!currentUser) return 0;
    const today = new Date().toDateString();
    if (currentUser.lastAdsResetDate !== today) {
      return DAILY_ADS_LIMIT;
    }
    return DAILY_ADS_LIMIT - currentUser.adsWatchedToday;
  };

  // KYC
  const submitKYC = (fullName: string, photoBase64: string) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      kycStatus: 'pending' as const,
      kycData: {
        fullName,
        photoBase64,
        submittedAt: new Date().toISOString(),
      },
    };
    updateUser(updatedUser);
  };

  const approveKYC = (userId: string) => {
    const user = getUserById(userId);
    if (user) {
      updateUser({ ...user, kycStatus: 'approved' });
      
      // Give referral commission to referrer only after KYC is approved
      if (user.referredBy) {
        const referrer = getUserById(user.referredBy);
        if (referrer) {
          // Check if this referral commission hasn't been given yet
          // (We can track this by checking if the referrer already got points for this user)
          const alreadyRewarded = localStorage.getItem(`referral_reward_${user.id}`);
          if (!alreadyRewarded) {
            updateUser({ ...referrer, points: referrer.points + POINTS_PER_REFERRAL });
            localStorage.setItem(`referral_reward_${user.id}`, 'true');
          }
        }
      }
    }
  };

  const rejectKYC = (userId: string) => {
    const user = getUserById(userId);
    if (user) {
      updateUser({ ...user, kycStatus: 'rejected' });
    }
  };

  const getPendingKYC = () => users.filter(u => u.kycStatus === 'pending');

  // Bank Account
  const addBankAccount = (accountHolderName: string, bankName: string, accountNumber: string): boolean => {
    if (!currentUser) return false;
    
    // Check if KYC name matches bank account name
    if (currentUser.kycStatus !== 'approved' || !currentUser.kycData) return false;
    if (currentUser.kycData.fullName.toLowerCase() !== accountHolderName.toLowerCase()) return false;

    const updatedUser = {
      ...currentUser,
      bankAccount: {
        accountHolderName,
        bankName,
        accountNumber,
      },
    };
    updateUser(updatedUser);
    return true;
  };

  // Pool
  const resetDailyPool = () => {
    setDailyPoolUsed(0);
    setLastPoolResetDate(new Date().toDateString());
  };

  // Referral
  const getReferralCount = (userId: string) => 
    users.filter(u => u.referredBy === userId).length;

  // Theme
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const value: AppContextType = {
    currentUser,
    isAdmin,
    login,
    adminLogin,
    signup,
    logout,
    currentView,
    navigateTo,
    users,
    getUserById,
    updateUser,
    banUser,
    unbanUser,
    tasks,
    addTask,
    deleteTask,
    getActiveTasks,
    taskSubmissions,
    submitTask,
    approveTaskSubmission,
    rejectTaskSubmission,
    getUserSubmissions,
    getPendingSubmissions,
    withdrawals,
    requestWithdrawal,
    approveWithdrawal,
    rejectWithdrawal,
    getPendingWithdrawals,
    getUserWithdrawals,
    claimDailyLogin,
    watchAd,
    getAdsRemaining,
    submitKYC,
    approveKYC,
    rejectKYC,
    getPendingKYC,
    addBankAccount,
    dailyPoolLimit,
    dailyPoolRemaining: dailyPoolLimit - dailyPoolUsed,
    resetDailyPool,
    getReferralCount,
    darkMode,
    toggleDarkMode,
    isLoading,
    setLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}
