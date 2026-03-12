import { useState, useRef } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Zap, Sun, Moon, Home, Wallet, ListTodo, User, ArrowLeft,
  ExternalLink, Upload, CheckCircle, Clock, Loader2, X, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

export function TasksPage() {
  const { 
    currentUser, navigateTo, darkMode, toggleDarkMode,
    getActiveTasks, getUserSubmissions, submitTask, setLoading
  } = useAppState();
  
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [proofImageBase64, setProofImageBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const tasks = getActiveTasks();
  const userSubmissions = getUserSubmissions(currentUser.id);

  const getTaskStatus = (taskId: string) => {
    const submission = userSubmissions.find(s => s.taskId === taskId);
    return submission?.status || null;
  };

  const handleOpenTask = (task: any) => {
    setSelectedTask(task);
    setShowTaskDialog(true);
  };

  const handleOpenSubmit = () => {
    setShowTaskDialog(false);
    setShowSubmitDialog(true);
  };

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
      setProofImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!proofImageBase64) {
      toast.error('Please upload a screenshot');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    submitTask(selectedTask.id, proofImageBase64);
    toast.success('Task submitted for review!');
    
    setProofImageBase64('');
    setShowSubmitDialog(false);
    setSelectedTask(null);
    setIsSubmitting(false);
    setLoading(false);
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
          <h1 className="text-xl font-bold mb-1">Available Tasks</h1>
          <p className="text-sm text-muted-foreground">Complete tasks to earn points</p>
        </div>

        {/* Points Summary */}
        <Card className="p-4 mb-6 gradient-card text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Your Balance</p>
              <p className="text-2xl font-bold">{currentUser.points.toLocaleString()} pts</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <Card className="p-8 text-center">
              <ListTodo className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-semibold mb-1">No tasks available</h3>
              <p className="text-sm text-muted-foreground">Check back later for new tasks</p>
            </Card>
          ) : (
            tasks.map((task) => {
              const status = getTaskStatus(task.id);
              return (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{task.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        {task.points.toLocaleString()} pts
                      </Badge>
                    </div>
                    {status === 'pending' && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {status === 'approved' && (
                      <Badge className="bg-green-500 text-white text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    variant={status ? 'outline' : 'default'}
                    disabled={!!status}
                    onClick={() => handleOpenTask(task)}
                  >
                    {status === 'pending' ? 'Under Review' : status === 'approved' ? 'Completed' : 'Start Task'}
                  </Button>
                </Card>
              );
            })
          )}
        </div>
      </main>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">{selectedTask?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Reward</p>
              <Badge variant="secondary">
                <Zap className="h-3 w-3 mr-1" />
                {selectedTask?.points.toLocaleString()} points
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Instructions</p>
              <div className="p-3 rounded-lg bg-secondary text-sm whitespace-pre-wrap">
                {selectedTask?.instructions}
              </div>
            </div>
            <a 
              href={selectedTask?.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Task Link
              </Button>
            </a>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleOpenSubmit}
            >
              <Upload className="h-4 w-4 mr-2" />
              Submit Proof
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Proof Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">Submit Proof</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please upload a screenshot showing you completed the task.
            </p>
            
            {/* File Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {proofImageBase64 ? (
                <div className="relative">
                  <img 
                    src={proofImageBase64} 
                    alt="Preview" 
                    className="max-h-40 mx-auto rounded-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Click to change image</p>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload screenshot</p>
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

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowSubmitDialog(false);
                  setProofImageBase64('');
                  setShowTaskDialog(true);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSubmitProof}
                disabled={isSubmitting || !proofImageBase64}
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
            className="flex flex-col items-center gap-1 p-2 text-primary"
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
