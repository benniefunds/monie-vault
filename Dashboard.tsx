import { useState, useEffect } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Sun, Moon, Home, Wallet, ListTodo, User, 
  Gift, Play, Users, ChevronRight, ExternalLink, CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export function Dashboard() {
  const { 
    currentUser, navigateTo, darkMode, toggleDarkMode,
    claimDailyLogin, watchAd, getAdsRemaining, getReferralCount,
    setLoading
  } = useAppState();
  
  const [isClaiming, setIsClaiming] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(15);
  const [adsRemaining, setAdsRemaining] = useState(5);

  useEffect(() => {
    if (currentUser) {
      setAdsRemaining(getAdsRemaining());
    }
  }, [currentUser, getAdsRemaining]);

  if (!currentUser) return null;

  const handleClaimDaily = async () => {
    if (currentUser.dailyLoginClaimed) {
      toast.info('You have already claimed today\'s reward');
      return;
    }
    
    setIsClaiming(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success = claimDailyLogin();
    if (success) {
      toast.success(`Claimed ${1000 + Math.min(currentUser.loginStreak * 10, 100)} points!`);
    }
    
    setIsClaiming(false);
    setLoading(false);
  };

  const handleWatchAd = async () => {
    if (adsRemaining <= 0) {
      toast.info('You have watched all ads for today');
      return;
    }
    
    setIsWatchingAd(true);
    setAdCountdown(15);
    
    // Start countdown
    const countdownInterval = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const success = await watchAd();
    clearInterval(countdownInterval);
    
    if (success) {
      setAdsRemaining(getAdsRemaining());
      toast.success('Earned 1,200 points!');
    }
    
    setIsWatchingAd(false);
    setAdCountdown(15);
  };

  const referralCount = getReferralCount(currentUser.id);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">Monie Vault</span>
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
      <main className="flex-1 px-4 py-6 pb-24 max-w-lg mx-auto w-full">
        {/* Welcome & Points */}
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">Hello, {currentUser.fullName.split(' ')[0]}!</h1>
          <p className="text-sm text-muted-foreground">Here's your earning summary</p>
        </div>

        {/* Points Card */}
        <Card className="gradient-card text-white p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/80 text-sm">Your Balance</span>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Zap className="h-3 w-3 mr-1" />
              {currentUser.points.toLocaleString()} pts
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">
            ₦{(currentUser.points / 10).toLocaleString()}
          </div>
          <p className="text-white/60 text-sm">≈ ${(currentUser.points / 10 / 1500).toFixed(2)} USD</p>
        </Card>

        {/* WhatsApp Channel */}
        <Card className="p-4 mb-4 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Join Our WhatsApp Channel</h3>
              <p className="text-xs text-muted-foreground truncate">Get updates and exclusive offers</p>
            </div>
            <a 
              href="https://whatsapp.com/channel/0029VbAaJpAHVvTQvBB8pw1h"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                Join
              </Button>
            </a>
          </div>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Daily Login */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Gift className="h-4 w-4 text-orange-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Daily Login</span>
            </div>
            <div className="text-lg font-bold mb-1">Day {currentUser.loginStreak}</div>
            <p className="text-xs text-muted-foreground mb-3">
              {currentUser.dailyLoginClaimed ? 'Claimed today' : 'Claim now!'}
            </p>
            <Button 
              size="sm" 
              className="w-full"
              variant={currentUser.dailyLoginClaimed ? 'outline' : 'default'}
              onClick={handleClaimDaily}
              disabled={currentUser.dailyLoginClaimed || isClaiming}
            >
              {isClaiming ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : currentUser.dailyLoginClaimed ? (
                <><CheckCircle className="h-3 w-3 mr-1" /> Claimed</>
              ) : (
                'Claim'
              )}
            </Button>
          </Card>

          {/* Watch Ads */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Play className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Watch Ads</span>
            </div>
            <div className="text-lg font-bold mb-1">{adsRemaining}/5</div>
            <p className="text-xs text-muted-foreground mb-3">1,200 pts per ad (15s)</p>
            <Button 
              size="sm" 
              className="w-full"
              variant={adsRemaining === 0 ? 'outline' : 'default'}
              onClick={handleWatchAd}
              disabled={adsRemaining === 0 || isWatchingAd}
            >
              {isWatchingAd ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {adCountdown}s
                </span>
              ) : adsRemaining === 0 ? (
                'Done'
              ) : (
                'Watch'
              )}
            </Button>
          </Card>
        </div>

        {/* Referral Card */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Refer & Earn</h3>
                <p className="text-xs text-muted-foreground">5,000 pts per referral</p>
              </div>
            </div>
            <Badge variant="secondary">{referralCount} refs</Badge>
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
        </Card>

        {/* Quick Links */}
        <h2 className="font-semibold mb-3">Quick Links</h2>
        <div className="space-y-2">
          <button 
            onClick={() => navigateTo('tasks')}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Available Tasks</h3>
                <p className="text-xs text-muted-foreground">Complete tasks to earn</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button 
            onClick={() => navigateTo('wallet')}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">My Wallet</h3>
                <p className="text-xs text-muted-foreground">Withdraw your earnings</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button 
            onClick={() => navigateTo('profile')}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <User className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">My Profile</h3>
                <p className="text-xs text-muted-foreground">KYC & Account settings</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <button 
            onClick={() => navigateTo('dashboard')}
            className="flex flex-col items-center gap-1 p-2 text-primary"
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
