import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap, Sun, Moon, Users, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function LandingPage() {
  const { navigateTo, darkMode, toggleDarkMode, adminLogin, setLoading } = useAppState();
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">Monie Vault</span>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Hero Card */}
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="gradient-card p-6 text-white text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-4">
                <Zap className="h-3 w-3" />
                Earn Real Money Daily
              </div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome to<br />Monie Vault
              </h1>
              <p className="text-white/80 text-sm">
                Complete social tasks, earn points, and withdraw to your Nigerian bank account.
              </p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 bg-card">
              <div className="text-center p-3 rounded-lg bg-secondary">
                <div className="text-lg font-bold text-primary">100+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Tasks</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary">
                <div className="text-lg font-bold text-green-500">Fast</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Payouts</div>
              </div>
            </div>
          </Card>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigateTo('signup')}
              className="w-full h-12 gradient-primary hover:opacity-90 transition-opacity text-white font-semibold"
            >
              Create Free Account
            </Button>
            <Button 
              onClick={() => navigateTo('login')}
              variant="outline"
              className="w-full h-12 font-semibold"
            >
              Sign In
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs text-muted-foreground">Refer & Earn</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <Wallet className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs text-muted-foreground">Daily Tasks</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <Zap className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs text-muted-foreground">Watch Ads</div>
            </div>
          </div>
        </div>
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
          <button 
            onClick={() => setShowAdminDialog(true)}
            className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground ml-1 transition-colors"
          >
            tech
          </button>
        </p>
      </footer>

      {/* Admin Login Dialog */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">Admin Login</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              setLoading(true);
              await new Promise(resolve => setTimeout(resolve, 800));
              const success = adminLogin(adminEmail, adminPassword);
              if (!success) {
                toast.error('Invalid admin credentials');
              }
              setIsSubmitting(false);
              setLoading(false);
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@btech.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button 
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Login as Admin'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
