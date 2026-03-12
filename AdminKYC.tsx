import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Zap, Sun, Moon, ArrowLeft, Shield, CheckCircle, XCircle, User, Eye
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminKYC() {
  const { 
    isAdmin, getPendingKYC, approveKYC, rejectKYC, navigateTo, darkMode, toggleDarkMode,
    setLoading
  } = useAppState();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);

  const pendingKYC = getPendingKYC();

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

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedUser) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    approveKYC(selectedUser.id);
    toast.success('KYC approved!');
    setShowUserDialog(false);
    setSelectedUser(null);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedUser) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    rejectKYC(selectedUser.id);
    toast.success('KYC rejected!');
    setShowUserDialog(false);
    setSelectedUser(null);
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
          <h1 className="text-xl font-bold mb-1">KYC Verifications</h1>
          <p className="text-sm text-muted-foreground">
            {pendingKYC.length} pending verification{pendingKYC.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* KYC List */}
        <div className="space-y-3">
          {pendingKYC.length === 0 ? (
            <Card className="p-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="text-sm text-muted-foreground">No pending KYC verifications</p>
            </Card>
          ) : (
            pendingKYC.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {user.kycData ? new Date(user.kycData.submittedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewUser(user)}
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

      {/* Review KYC Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Review KYC</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-lg">{selectedUser.fullName}</h3>
                <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">KYC Name</p>
                <p className="font-medium">{selectedUser.kycData?.fullName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Photo</p>
                {selectedUser.kycData?.photoBase64 && (
                  <img 
                    src={selectedUser.kycData.photoBase64} 
                    alt="KYC Photo" 
                    className="w-full max-h-60 object-contain rounded-lg border"
                  />
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Submitted On</p>
                <p className="text-sm">
                  {selectedUser.kycData ? new Date(selectedUser.kycData.submittedAt).toLocaleString() : 'N/A'}
                </p>
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
