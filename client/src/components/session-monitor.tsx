
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";

// Inactivity limits in milliseconds
// 30 minutes for normal session
const INACTIVITY_LIMIT = 30 * 60 * 1000; 
// 60 seconds warning before logout
const WARNING_DURATION = 60 * 1000; 

export function SessionMonitor() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_DURATION / 1000);

  const performLogout = async () => {
    try {
        await logout();
        setShowWarning(false);
        toast({
            title: "Session Expired",
            description: "You have been logged out due to inactivity.",
            variant: "destructive"
        });
    } catch (e) {
        console.error("Logout failed", e);
    }
  };

  const resetTimer = useCallback(() => {
    if (!showWarning) {
        setLastActivity(Date.now());
    }
  }, [showWarning]);

  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    // Throttle the event listener to avoid performance issues
    let timeoutId: NodeJS.Timeout | undefined;
    const handleActivity = () => {
        if (!timeoutId) {
            timeoutId = setTimeout(() => {
                resetTimer();
                timeoutId = undefined;
            }, 1000);
        }
    };

    events.forEach(event => window.addEventListener(event, handleActivity));

    const intervalId = setInterval(() => {
        const now = Date.now();
        const inactiveTime = now - lastActivity;

        if (inactiveTime >= INACTIVITY_LIMIT && !showWarning) {
            setShowWarning(true);
        }
    }, 1000);

    return () => {
        events.forEach(event => window.removeEventListener(event, handleActivity));
        clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, lastActivity, resetTimer, showWarning]);

  // Second effect for handling the countdown when warning is shown
  useEffect(() => {
    if (!showWarning) {
        setTimeLeft(WARNING_DURATION / 1000);
        return;
    }

    const timerId = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                // Time expired
                clearInterval(timerId);
                performLogout();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timerId);
  }, [showWarning]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    setLastActivity(Date.now());
  };

  if (!user || !showWarning) return null;

  return (
    <AlertDialog open={showWarning}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <Clock className="h-5 w-5" />
                    <AlertDialogTitle>Session Timeout Warning</AlertDialogTitle>
                </div>
                <AlertDialogDescription>
                    You have been inactive for a while. For security reasons, you will be logged out in <span className="font-bold text-foreground">{timeLeft}</span> seconds.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={handleStayLoggedIn}>
                    Stay Logged In
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
