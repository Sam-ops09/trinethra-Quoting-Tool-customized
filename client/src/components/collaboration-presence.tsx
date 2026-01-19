import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCollaboration } from "@/lib/websocket-context";
import { cn } from "@/lib/utils";

interface CollaborationPresenceProps {
  entityType: string;
  entityId: string;
  className?: string;
}

// Generate a consistent color based on user ID
function getUserColor(userId: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CollaborationPresence({ entityType, entityId, className }: CollaborationPresenceProps) {
  const { collaborators } = useCollaboration(entityType, entityId);
  const [editingUser, setEditingUser] = useState<{ name: string; field?: string } | null>(null);

  // Track who's editing
  useEffect(() => {
    const editing = collaborators.find((c) => c.isEditing);
    if (editing) {
      setEditingUser({
        name: editing.userName,
        field: editing.cursorPosition?.field,
      });
    } else {
      setEditingUser(null);
    }
  }, [collaborators]);

  if (collaborators.length === 0) {
    return null;
  }

  const displayCount = 3;
  const visibleCollaborators = collaborators.slice(0, displayCount);
  const remainingCount = collaborators.length - displayCount;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Avatar Stack */}
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {visibleCollaborators.map((collaborator, index) => (
            <Tooltip key={collaborator.userId}>
              <TooltipTrigger asChild>
                <Avatar
                  className={cn(
                    "h-8 w-8 border-2 border-background ring-0",
                    collaborator.isEditing && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{ zIndex: visibleCollaborators.length - index }}
                >
                  <AvatarFallback className={cn("text-white text-xs", getUserColor(collaborator.userId))}>
                    {getInitials(collaborator.userName)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{collaborator.userName}</p>
                {collaborator.isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Currently editing{collaborator.cursorPosition?.field ? ` (${collaborator.cursorPosition.field})` : ""}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 border-2 border-background -ml-2">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {collaborators.slice(displayCount).map((c) => (
                  <p key={c.userId} className="text-sm">{c.userName}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Collaborator Count */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {collaborators.length} viewing
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium mb-1">Active Collaborators</p>
          <ul className="text-xs space-y-0.5">
            {collaborators.map((c) => (
              <li key={c.userId} className="flex items-center gap-1">
                <span className={cn("w-2 h-2 rounded-full", c.isEditing ? "bg-green-500" : "bg-gray-400")} />
                {c.userName}
                {c.isEditing && <span className="text-muted-foreground">(editing)</span>}
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>

      {/* Editing Indicator */}
      {editingUser && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground animate-pulse">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>
            {editingUser.name} is editing
            {editingUser.field && <span className="text-primary"> {editingUser.field}</span>}
            ...
          </span>
        </div>
      )}
    </div>
  );
}

// Simpler version for inline use
export function CollaborationIndicator({ entityType, entityId }: { entityType: string; entityId: string }) {
  const { collaborators } = useCollaboration(entityType, entityId);

  if (collaborators.length === 0) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="gap-1 cursor-default">
          <Users className="h-3 w-3" />
          {collaborators.length}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium text-xs">
          {collaborators.length} {collaborators.length === 1 ? "person" : "people"} viewing
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
