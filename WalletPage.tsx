import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Zap, Sun, Moon, Home, Wallet, ListTodo, User, ArrowLeft,
  Building2, UserCircle, Hash, AlertCircle, CheckCircle, Clock,
  Loader2, Plus, X
} from 'lucide-react';
import { toast } from 'sonner';

export function WalletPage() {
  const { 
    currentUser, navigateTo, darkMode, toggleDarkMode,
    addBankAccount, requestWithdrawal, getUserWithdrawals,
    dailyPoolRemaining, setLoading
  } = useAppState();
  
  const [showAddBankDialog, setShowAddBankDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const userWithdrawals = getUserWithdrawals(currentUser.id);
  const MIN_WITHDRAWAL = 50000; // 50,000 points = 5,000 naira

  const handleAddBankAccount = async () => {
    if (!accountHolderName || !bankName || !accountNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = addBankAccount(accountHolderName, bankName, accountNumber);
    if (success) {
      toast.success('Bank account added successfully!');
      setShowAddBankDialog(false);
      setAccountHolderName('');
      setBankName('');
      setAccountNumber('');
    } else {
      toast.error('Bank account name must match your KYC name');
    }
    
    setIsSubmitting(false);
    setLoading(false);
  };

  const handleWithdraw = async () => {
    const points = parseInt(withdrawAmount);
    
    if (!points || points < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is ${MIN_WITHDRAWAL.toLocaleString()} points (₦10,000)`);
      return;
    }

    if (points > currentUser.points) {
      toast.error('Insufficient balance');
      return;
    }

    if (points > dailyPoolRemaining) {
      toast.error('Daily pool limit exceeded. Try again tomorrow.');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = requestWithdrawal(points);
    if (success) {
      toast.success('Withdrawal request submitted!');
      setShowWithdrawDialog(false);
      setWithdrawAmount('');
    } else {
      toast.error('Failed to process withdrawal');
    }
    
    setIsSubmitting(false);
    setLoading(false);
  };

  const canWithdraw = currentUser.kycStatus === 'approved' && currentUser.bankAccount;

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
          <h1 className="text-xl font-bold mb-1">My Wallet</h1>
          <p className="text-sm text-muted-foreground">Manage your earnings</p>
        </div>

        {/* Balance Card */}
        <Card className="gradient-card text-white p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/80 text-sm">Total Balance</span>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              10 pts = ₦1
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">
            ₦{(currentUser.points / 10).toLocaleString()}
          </div>
          <p className="text-white/60 text-sm">
            {currentUser.points.toLocaleString()} points
          </p>
        </Card>

        {/* Pool Status */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Daily Pool Limit</span>
            <Badge variant="outline">1,000,000 pts</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pool Remaining Today</span>
            <span className="font-semibold text-primary">{dailyPoolRemaining.toLocaleString()} pts</span>
          </div>
        </Card>

        {/* Bank Account */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Bank Account</h3>
            {!currentUser.bankAccount && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowAddBankDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
          
          {currentUser.bankAccount ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{currentUser.bankAccount.bankName}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.bankAccount.accountNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{currentUser.bankAccount.accountHolderName}</p>
                  <p className="text-xs text-muted-foreground">Account Holder</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Building2 className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No bank account added</p>
              {currentUser.kycStatus !== 'approved' && (
                <p className="text-xs text-orange-500 mt-1">Complete KYC to add bank account</p>
              )}
            </div>
          )}
        </Card>

        {/* Withdraw Button */}
        <Button 
          className="w-full h-12 mb-6"
          disabled={!canWithdraw || currentUser.points < MIN_WITHDRAWAL}
          onClick={() => setShowWithdrawDialog(true)}
        >
          <Wallet className="h-5 w-5 mr-2" />
          Request Payout
        </Button>

        {!canWithdraw && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 mb-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              {currentUser.kycStatus !== 'approved' ? (
                <p>Complete KYC verification to enable withdrawals</p>
              ) : (
                <p>Add a bank account to withdraw</p>
              )}
            </div>
          </div>
        )}

        {currentUser.points < MIN_WITHDRAWAL && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 mb-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p>Minimum withdrawal: {MIN_WITHDRAWAL.toLocaleString()} points (₦5,000)</p>
            </div>
          </div>
        )}

        {/* Withdrawal History */}
        <h3 className="font-semibold mb-3">Withdrawal History</h3>
        <div className="space-y-2">
          {userWithdrawals.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No withdrawals yet</p>
            </Card>
          ) : (
            userWithdrawals.map((withdrawal) => (
              <Card key={withdrawal.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">₦{withdrawal.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(withdrawal.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={withdrawal.status === 'approved' ? 'default' : 'outline'}
                    className={withdrawal.status === 'approved' ? 'bg-green-500' : ''}
                  >
                    {withdrawal.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                    {withdrawal.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Add Bank Account Dialog */}
      <Dialog open={showAddBankDialog} onOpenChange={setShowAddBankDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">Add Bank Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Account name must match your KYC name: <strong>{currentUser.kycData?.fullName}</strong>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Account Holder Name</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Enter account holder name"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Bank Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Enter bank name"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Account Number</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter account number"
                  maxLength={10}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowAddBankDialog(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleAddBankAccount}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save Account'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">Request Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
              <p className="text-2xl font-bold">{currentUser.points.toLocaleString()} pts</p>
              <p className="text-sm text-muted-foreground">≈ ₦{(currentUser.points / 10).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Amount (points)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={`Min: ${MIN_WITHDRAWAL.toLocaleString()}`}
                min={MIN_WITHDRAWAL}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You'll receive: ₦{withdrawAmount ? (parseInt(withdrawAmount) / 10).toLocaleString() : '0'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm font-medium mb-1">Bank Account</p>
              <p className="text-sm">{currentUser.bankAccount?.bankName}</p>
              <p className="text-xs text-muted-foreground">{currentUser.bankAccount?.accountNumber}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowWithdrawDialog(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleWithdraw}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Approve Payout'
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
            className="flex flex-col items-center gap-1 p-2 text-primary"
          >
            <Wallet className="h-5 w-5" />
            <span className="text-xs">Wallet</span>
          </button>
          <button 
            onClick={() => navigateTo('profile')}
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
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
