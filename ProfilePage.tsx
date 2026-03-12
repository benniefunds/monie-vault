import { useState, useRef } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Zap, Sun, Moon, Home, Wallet, ListTodo, User, ArrowLeft, LogOut,
  Users, Building2, CheckCircle, Clock, XCircle, Camera, Upload,
  Loader2, ChevronRight, Shield, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const { 
    currentUser, logout, navigateTo, darkMode, toggleDarkMode,
    submitKYC, getReferralCount, setLoading
  } = useAppState();
  
  const [showKYCDialog, setShowKYCDialog] = useState(false);
  const [kycName, setKycName] = useState('');
  const [kycPhotoBase64, setKycPhotoBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const referralCount = getReferralCount(currentUser.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setKycPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitKYC = async () => {
    if (!kycName || !kycPhotoBase64) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    submitKYC(kycName, kycPhotoBase64);
    toast.success('KYC submitted for review!');
    
    setKycName('');
    setKycPhotoBase64('');
    setShowKYCDialog(false);
    setIsSubmitting(false);
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    logout();
    toast.success('Logged out successfully');
    setLoading(false);
  };

  const getKYCStatusBadge = () => {
    switch (currentUser.kycStatus) {
      case 'approved':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Submitted
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigateTo('dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">Monie Vault</span>
          </div>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24 max-w-lg mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 mb-6 text-center">
          <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-1">{currentUser.fullName}</h2>
          <p className="text-sm text-muted-foreground mb-3">@{currentUser.username}</p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">
              <Zap className="h-3 w-3 mr-1" />
              {currentUser.points.toLocaleString()} pts
            </Badge>
            {getKYCStatusBadge()}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{referralCount}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </Card>
          <Card className="p-4 text-center">
            <Zap className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{currentUser.loginStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 mb-6">
          {/* KYC Verification */}
          <button 
            onClick={() => {
              if (currentUser.kycStatus === 'not_submitted' || currentUser.kycStatus === 'rejected') {
                setShowKYCDialog(true);
              }
            }}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">KYC Verification</h3>
                <p className="text-xs text-muted-foreground">
                  {currentUser.kycStatus === 'approved' ? 'Verified' : 
                   currentUser.kycStatus === 'pending' ? 'Under review' : 
                   'Required for withdrawals'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getKYCStatusBadge()}
              {(currentUser.kycStatus === 'not_submitted' || currentUser.kycStatus === 'rejected') && (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {/* Bank Account */}
          <button 
            onClick={() => navigateTo('wallet')}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Bank Account</h3>
                <p className="text-xs text-muted-foreground">
                  {currentUser.bankAccount ? 'Account added' : 'Add bank account'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Referral Code */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Referral Code</h3>
                <p className="text-xs text-muted-foreground">Share to earn 5,000 pts</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm font-mono">
                {currentUser.referralCode}
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(currentUser.referralCode);
                  toast.success('Referral code copied!');
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </main>

      {/* KYC Dialog */}
      <Dialog open={showKYCDialog} onOpenChange={setShowKYCDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">KYC Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Please provide your full name and a clear photo for verification.
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={kycName}
                  onChange={(e) => setKycName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
            </div>
            
            {/* Photo Upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">Your Photo</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {kycPhotoBase64 ? (
                  <div className="relative">
                    <img 
                      src={kycPhotoBase64} 
                      alt="Preview" 
                      className="max-h-32 mx-auto rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Click to change photo</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 5MB (JPG, PNG)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowKYCDialog(false);
                  setKycName('');
                  setKycPhotoBase64('');
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSubmitKYC}
                disabled={isSubmitting || !kycPhotoBase64}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Submit</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <button 
            onClick={() => navigateTo('dashboard')}
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </button>
          <button 
            onClick={() => navigateTo('tasks')}
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
          >
            <ListTodo className="h-5 w-5" />
            <span className="text-xs">Tasks</span>
          </button>
          <button 
            onClick={() => navigateTo('wallet')}
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
          >
            <Wallet className="h-5 w-5" />
            <span className="text-xs">Wallet</span>
          </button>
          <button 
            onClick={() => navigateTo('profile')}
            className="flex flex-col items-center gap-1 p-2 text-primary"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="py-4 text-center pb-24">
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
