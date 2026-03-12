import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Zap, Sun, Moon, ArrowLeft, Wallet, CheckCircle, XCircle, Building2, User, Eye
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminWithdrawals() {
  const { 
    isAdmin, getPendingWithdrawals, approveWithdrawal, rejectWithdrawal, 
    navigateTo, darkMode, toggleDarkMode, setLoading
  } = useAppState();

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);

  const pendingWithdrawals = getPendingWithdrawals();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-sm">
          <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-4">Admin access required.</p>
          <Button onClick={() => navigateTo('landing')} className="w-full">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const handleViewWithdrawal = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setShowWithdrawalDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    approveWithdrawal(selectedWithdrawal.id);
    toast.success('Withdrawal approved!');
    setShowWithdrawalDialog(false);
    setSelectedWithdrawal(null);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    rejectWithdrawal(selectedWithdrawal.id);
    toast.success('Withdrawal rejected!');
    setShowWithdrawalDialog(false);
    setSelectedWithdrawal(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigateTo('admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">Monie Vault</span>
              <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
            </div>
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
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">Withdrawals</h1>
          <p className="text-sm text-muted-foreground">
            {pendingWithdrawals.length} pending withdrawal{pendingWithdrawals.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Withdrawals List */}
        <div className="space-y-3">
          {pendingWithdrawals.length === 0 ? (
            <Card className="p-6 text-center">
              <Wallet className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="text-sm text-muted-foreground">No pending withdrawals</p>
            </Card>
          ) : (
            pendingWithdrawals.map((withdrawal) => (
              <Card key={withdrawal.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">₦{withdrawal.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {withdrawal.pointsUsed.toLocaleString()} points
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {withdrawal.user?.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(withdrawal.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewWithdrawal(withdrawal)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Review Withdrawal Dialog */}
      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Review Withdrawal</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="text-center p-4 rounded-lg gradient-card text-white">
                <p className="text-white/80 text-sm mb-1">Amount</p>
                <p className="text-3xl font-bold">₦{selectedWithdrawal.amount.toLocaleString()}</p>
                <p className="text-white/60 text-sm">
                  {selectedWithdrawal.pointsUsed.toLocaleString()} points
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">User</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedWithdrawal.user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">@{selectedWithdrawal.user?.username}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Bank Account</p>
                <Card className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedWithdrawal.bankAccount?.bankName}</span>
                  </div>
                  <p className="text-sm">{selectedWithdrawal.bankAccount?.accountHolderName}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedWithdrawal.bankAccount?.accountNumber}
                  </p>
                </Card>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Requested On</p>
                <p className="text-sm">{new Date(selectedWithdrawal.requestedAt).toLocaleString()}</p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={handleApprove}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
