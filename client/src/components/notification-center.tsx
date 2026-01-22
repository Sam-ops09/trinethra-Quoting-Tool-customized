import { useState, forwardRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/lib/websocket-context";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    isRead: boolean;
    createdAt: Date;
  };
  onRead: (id: string) => void;
  onNavigate: (entityType: string, entityId: string) => void;
  index: number;
}

const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  ({ notification, onRead, onNavigate, index }, ref) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case "quote_status_change": return "📋";
        case "approval_request": return "⏳";
        case "approval_decision": return "✅";
        case "payment_received": return "💰";
        case "payment_overdue": return "⚠️";
        case "collaboration_joined": return "👥";
        case "collaboration_edit": return "✏️";
        case "system_announcement": return "📢";
        default: return "🔔";
      }
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case "payment_received": return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
        case "payment_overdue": return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
        case "approval_request": return "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
        case "approval_decision": return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
        case "system_announcement": return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
        default: return "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400";
      }
    };

    const handleClick = () => {
      if (!notification.isRead) {
        onRead(notification.id);
      }
      if (notification.entityType && notification.entityId) {
        onNavigate(notification.entityType, notification.entityId);
      }
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, height: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }}
        className={cn(
          "group flex items-start gap-4 p-4 cursor-pointer transition-all rounded-xl border border-transparent mx-2 my-1 relative overflow-hidden",
          !notification.isRead 
            ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30" 
            : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
        )}
        onClick={handleClick}
      >
        <div className={cn("rounded-xl p-2.5 text-xl shadow-sm shrink-0", getTypeColor(notification.type))}>
          {getTypeIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn("text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100", !notification.isRead && "text-indigo-900 dark:text-indigo-100")}>
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50 shrink-0 mt-1" />
            )}
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {notification.message}
          </p>
          
          <div className="flex items-center gap-2 pt-1">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
            {notification.entityType && notification.entityId && (
              <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View details</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

interface NotificationListProps {
  notifications: any[];
  onRead: (id: string) => void;
  onNavigate: (type: string, id: string) => void;
  onClose: () => void;
}

function NotificationList({ notifications, onRead, onNavigate, onClose }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground p-8 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Bell className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <p className="text-base font-medium text-slate-900 dark:text-white">All caught up!</p>
          <p className="text-sm text-slate-500 mt-1">No new notifications at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-1">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            index={index}
            notification={notification}
            onRead={onRead}
            onNavigate={onNavigate}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function NotificationCenter() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const isMobile = useMobile();

  const handleNavigate = (entityType: string, entityId: string) => {
    setIsOpen(false);
    const routeMap: Record<string, string> = {
      quote: `/quotes/${entityId}`,
      invoice: `/invoices/${entityId}`,
      sales_order: `/sales-orders/${entityId}`,
      client: `/clients/${entityId}`,
      vendor_po: `/vendor-pos/${entityId}`,
    };
    const route = routeMap[entityType];
    if (route) setLocation(route);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const TriggerButton = (
    <Button variant="ghost" size="icon" className="relative group overflow-visible">
      <div className="relative">
        <motion.div
          whileHover={{ rotate: [0, -20, 20, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
        </motion.div>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center ring-2 ring-white dark:ring-slate-950 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </div>
    </Button>
  );

  const Header = (
    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Notifications</h3>
        {unreadCount > 0 && (
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50">
            {unreadCount} new
          </Badge>
        )}
      </div>
      {notifications.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
          onClick={handleMarkAllAsRead}
        >
          <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
          Mark all read
        </Button>
      )}
    </div>
  );

  const Footer = notifications.length > 0 ? (
    <>
      <Separator className="bg-slate-100 dark:bg-slate-800" />
      <div className="p-2 bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-sm">
        <Button
          variant="ghost"
          className="w-full text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          onClick={() => setIsOpen(false)}
        >
          Close notifications
        </Button>
      </div>
    </>
  ) : null;

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {TriggerButton}
        </SheetTrigger>
        <SheetContent side="right" className="w-[85vw] sm:w-[380px] p-0 flex flex-col h-full border-l border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
          {Header}
          <ScrollArea className="flex-1 bg-white/50 dark:bg-slate-950/50">
            <NotificationList 
              notifications={notifications} 
              onRead={markAsRead} 
              onNavigate={handleNavigate}
              onClose={() => setIsOpen(false)}
            />
          </ScrollArea>
          {Footer}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {TriggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 border border-slate-200/50 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden" align="end" sideOffset={8}>
        {Header}
        <ScrollArea className="h-[480px] bg-white dark:bg-slate-950">
          <NotificationList 
            notifications={notifications} 
            onRead={markAsRead} 
            onNavigate={handleNavigate}
            onClose={() => setIsOpen(false)}
          />
        </ScrollArea>
        {Footer}
      </PopoverContent>
    </Popover>
  );
}
