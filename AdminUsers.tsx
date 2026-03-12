import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Zap, Sun, Moon, ArrowLeft, Users, Search, Eye, CheckCircle, XCircle,
  Shield, Building2, Zap as ZapIcon, Ban, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminUsers() {
  const { 
    isAdmin, users, navigateTo, darkMode, toggleDarkMode, getReferralCount,
    banUser, unbanUser, setLoading
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);

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

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    if (!confirm(`Are you sure you want to ban ${selectedUser.fullName}?`)) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    banUser(selectedUser.id);
    toast.success(`User ${selectedUser.fullName} has been banned`);
    setSelectedUser({ ...selectedUser, isBanned: true });
    setLoading(false);
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    unbanUser(selectedUser.id);
    toast.success(`User ${selectedUser.fullName} has been unbanned`);
    setSelectedUser({ ...selectedUser, isBanned: false });
    setLoading(false);
  };

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case 'pending':
        return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">Not Submitted</Badge>;
    }
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
          <h1 className="text-xl font-bold mb-1">All Users</h1>
          <p className="text-sm text-muted-foreground">{users.length} total users</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users List */}
        <div className="space-y-2">
          {filteredUsers.length === 0 ? (
            <Card className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No users found</p>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className={`p-4 ${user.isBanned ? 'opacity-60 border-destructive' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${user.isBanned ? 'bg-destructive' : 'gradient-primary'}`}>
                      <span className="text-white font-semibold text-sm">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{user.fullName}</p>
                        {user.isBanned && (
                          <Badge variant="destructive" className="text-xs">
                            <Ban className="h-3 w-3 mr-1" />
                            Banned
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleViewUser(user)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-2xl">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{selectedUser.fullName}</h3>
                <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 text-center">
                  <ZapIcon className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="font-bold">{selectedUser.points.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </Card>
                <Card className="p-3 text-center">
                  <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="font-bold">{getReferralCount(selectedUser.id)}</p>
                  <p className="text-xs text-muted-foreground">Referrals</p>
                </Card>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">KYC Status</p>
                {getKYCStatusBadge(selectedUser.kycStatus)}
              </div>

              {selectedUser.kycData && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">KYC Name</p>
                  <p className="text-sm font-medium">{selectedUser.kycData.fullName}</p>
                </div>
              )}

              {selectedUser.bankAccount && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Bank Account</p>
                  <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{selectedUser.bankAccount.bankName}</span>
                    </div>
                    <p className="text-sm">{selectedUser.bankAccount.accountHolderName}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.bankAccount.accountNumber}</p>
                  </Card>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Referral Code</p>
                <p className="text-sm font-mono bg-secondary p-2 rounded">{selectedUser.referralCode}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Joined</p>
                <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Ban/Unban Button */}
              <div className="pt-4 border-t">
                {selectedUser.isBanned ? (
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={handleUnbanUser}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Unban User
                  </Button>
                ) : (
                  <Button 
                    variant="destructive"
                    className="w-full"
                    onClick={handleBanUser}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </Button>
                )}
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
