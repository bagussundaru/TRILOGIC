import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell,
  BellOff,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  AlertOctagon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationPanel({ notifications }) {
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getIcon = (type) => {
    const icons = {
      'Info': Info,
      'Warning': AlertTriangle,
      'Error': AlertCircle,
      'Success': CheckCircle2,
      'Milestone': TrendingUp,
      'Escalation': AlertOctagon,
    };
    return icons[type] || Bell;
  };

  const getColors = (type) => {
    const colors = {
      'Info': 'bg-blue-100 text-blue-700 border-blue-200',
      'Warning': 'bg-amber-100 text-amber-700 border-amber-200',
      'Error': 'bg-red-100 text-red-700 border-red-200',
      'Success': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Milestone': 'bg-purple-100 text-purple-700 border-purple-200',
      'Escalation': 'bg-red-200 text-red-800 border-red-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs gap-1"
            >
              <Check className="w-3 h-3" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[400px] pr-4">
          <AnimatePresence>
            {displayNotifications.length > 0 ? (
              <div className="space-y-3">
                {displayNotifications.map((notification, index) => {
                  const Icon = getIcon(notification.notification_type);
                  const colors = getColors(notification.notification_type);
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border-2 ${colors} ${
                        !notification.is_read ? 'border-l-4' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">{notification.title}</p>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-white/50"
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm mt-1 opacity-90">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs opacity-70">
                              {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                            </span>
                            {notification.priority !== 'Medium' && (
                              <Badge variant="outline" className="text-xs">
                                {notification.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                <BellOff className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {notifications.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-3 text-teal-600"
          >
            {showAll ? 'Show less' : `View all (${notifications.length})`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}