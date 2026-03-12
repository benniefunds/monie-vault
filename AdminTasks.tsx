import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, Sun, Moon, ArrowLeft, ListTodo, Plus, Trash2, CheckCircle, XCircle,
  Eye, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminTasks() {
  const { 
    isAdmin, tasks, addTask, deleteTask, getPendingSubmissions,
    approveTaskSubmission, rejectTaskSubmission, navigateTo, darkMode, toggleDarkMode,
    setLoading
  } = useAppState();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [taskName, setTaskName] = useState('');
  const [taskPoints, setTaskPoints] = useState('');
  const [taskLink, setTaskLink] = useState('');
  const [taskInstructions, setTaskInstructions] = useState('');

  const pendingSubmissions = getPendingSubmissions();

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

  const handleAddTask = async () => {
    if (!taskName || !taskPoints || !taskLink || !taskInstructions) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    addTask({
      name: taskName,
      points: parseInt(taskPoints),
      link: taskLink,
      instructions: taskInstructions,
      isActive: true,
    });

    toast.success('Task added successfully!');
    setTaskName('');
    setTaskPoints('');
    setTaskLink('');
    setTaskInstructions('');
    setShowAddDialog(false);
    setIsSubmitting(false);
    setLoading(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    deleteTask(taskId);
    toast.success('Task deleted!');
    setLoading(false);
  };

  const handleViewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setShowSubmissionDialog(true);
  };

  const handleApproveSubmission = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    approveTaskSubmission(selectedSubmission.id);
    toast.success('Submission approved!');
    setShowSubmissionDialog(false);
    setSelectedSubmission(null);
    setLoading(false);
  };

  const handleRejectSubmission = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    rejectTaskSubmission(selectedSubmission.id);
    toast.success('Submission rejected!');
    setShowSubmissionDialog(false);
    setSelectedSubmission(null);
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
          <h1 className="text-xl font-bold mb-1">Manage Tasks</h1>
          <p className="text-sm text-muted-foreground">Add tasks and review submissions</p>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="submissions">
              Submissions
              {pendingSubmissions.length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">{pendingSubmissions.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Task
            </Button>

            {tasks.length === 0 ? (
              <Card className="p-6 text-center">
                <ListTodo className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No tasks yet</p>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{task.name}</h3>
                      <Badge variant="secondary" className="text-xs mb-2">
                        <Zap className="h-3 w-3 mr-1" />
                        {task.points.toLocaleString()} pts
                      </Badge>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.instructions}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-3">
            {pendingSubmissions.length === 0 ? (
              <Card className="p-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p className="text-sm text-muted-foreground">No pending submissions</p>
              </Card>
            ) : (
              pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{submission.task?.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        by {submission.user?.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewSubmission(submission)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Task Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Task Name</label>
              <Input
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g., Follow on Instagram"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Points Reward</label>
              <Input
                type="number"
                value={taskPoints}
                onChange={(e) => setTaskPoints(e.target.value)}
                placeholder="e.g., 500"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Task Link</label>
              <Input
                value={taskLink}
                onChange={(e) => setTaskLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Instructions</label>
              <Textarea
                value={taskInstructions}
                onChange={(e) => setTaskInstructions(e.target.value)}
                placeholder="Detailed instructions for users..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleAddTask}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Add Task'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Submission Dialog */}
      <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Review Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Task</p>
                <p className="font-semibold">{selectedSubmission.task?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">User</p>
                <p className="font-semibold">{selectedSubmission.user?.fullName}</p>
                <p className="text-xs text-muted-foreground">@{selectedSubmission.user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Proof Screenshot</p>
                {selectedSubmission.proofImageBase64 && (
                  <img 
                    src={selectedSubmission.proofImageBase64} 
                    alt="Proof" 
                    className="w-full max-h-60 object-contain rounded-lg border"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={handleRejectSubmission}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={handleApproveSubmission}
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
