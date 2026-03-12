// User Types
export interface User {
  id: string;
  fullName: string;
  username: string;
  password: string;
  points: number;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  lastLoginDate?: string;
  loginStreak: number;
  dailyLoginClaimed: boolean;
  adsWatchedToday: number;
  lastAdsResetDate: string;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  kycData?: {
    fullName: string;
    photoBase64: string;
    submittedAt: string;
  };
  bankAccount?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
  };
  isBanned?: boolean;
  deviceFingerprint?: string;
}

// Task Types
export interface Task {
  id: string;
  name: string;
  points: number;
  link: string;
  instructions: string;
  createdAt: string;
  isActive: boolean;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  proofImageBase64: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  task?: Task;
  user?: User;
}

// Withdrawal Types
export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  pointsUsed: number;
  bankAccount: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  user?: User;
}

// Admin Types
export interface Admin {
  email: string;
  password: string;
}

// App State
export interface AppState {
  currentUser: User | null;
  isAdmin: boolean;
  users: User[];
  tasks: Task[];
  taskSubmissions: TaskSubmission[];
  withdrawals: Withdrawal[];
  dailyPoolLimit: number;
  dailyPoolUsed: number;
  darkMode: boolean;
}

// Navigation
export type View = 
  | 'landing' 
  | 'login' 
  | 'signup' 
  | 'dashboard' 
  | 'tasks' 
  | 'wallet' 
  | 'profile' 
  | 'admin' 
  | 'admin-users' 
  | 'admin-tasks' 
  | 'admin-kyc' 
  | 'admin-withdrawals';
