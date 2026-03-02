import { useCallback, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface UseUndoActionOptions {
  /** The async function to execute after the countdown expires */
  action: () => Promise<any>;
  /** Message shown in the toast title, e.g. "Quote rejected" */
  message: string;
  /** Optional description shown below the title */
  description?: string;
  /** Delay in ms before execution (default: 5000) */
  delayMs?: number;
  /** Called after action() resolves successfully */
  onSuccess?: (data?: any) => void;
  /** Called if action() throws */
  onError?: (error: any) => void;
  /** Called when user clicks Undo */
  onUndo?: () => void;
}

/**
 * Hook that delays a destructive action, showing a countdown toast with an Undo button.
 *
 * Usage:
 * ```ts
 * const undoReject = useUndoAction({
 *   action: () => apiRequest("POST", `/api/quotes/${id}/reject`),
 *   message: "Quote rejected",
 *   onSuccess: () => queryClient.invalidateQueries(...)
 * });
 *
 * // In your button handler:
 * undoReject.trigger();
 * ```
 */
export function useUndoAction({
  action,
  message,
  description,
  delayMs = 5000,
  onSuccess,
  onError,
  onUndo,
}: UseUndoActionOptions) {
  const { toast: showToast, dismiss } = useToast();

  // Track active timer + toast so we can clean up on unmount
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastIdRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);

  // Cleanup on unmount — execute immediately if pending, don't leave orphaned timers
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // If there's a pending action when unmounting, execute it
      // (user navigated away, so undo opportunity is lost)
      if (toastIdRef.current && !cancelledRef.current) {
        // Fire and forget — component is unmounting
        action().then(onSuccess).catch(onError);
      }
      if (toastIdRef.current) {
        dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const trigger = useCallback(() => {
    cancelledRef.current = false;
    const seconds = Math.ceil(delayMs / 1000);

    // Show initial toast
    const { id, update, dismiss: dismissThis } = showToast({
      title: message,
      description: description || `Action will execute in ${seconds}s`,
      variant: "default",
      duration: delayMs + 2000, // slightly longer than delay so it doesn't auto-dismiss
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => {
            cancelledRef.current = true;
            cleanup();
            dismissThis();
            toastIdRef.current = null;
            onUndo?.();
            showToast({
              title: "Undone",
              description: `${message} — cancelled`,
              duration: 2000,
            });
          }}
        >
          Undo ({seconds}s)
        </ToastAction>
      ),
    });

    toastIdRef.current = id;

    // Countdown ticker — update the Undo button text each second
    let remaining = seconds - 1;
    intervalRef.current = setInterval(() => {
      if (remaining <= 0 || cancelledRef.current) {
        cleanup();
        return;
      }
      update({
        id,
        title: message,
        description: description || `Action will execute in ${remaining}s`,
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => {
              cancelledRef.current = true;
              cleanup();
              dismissThis();
              toastIdRef.current = null;
              onUndo?.();
              showToast({
                title: "Undone",
                description: `${message} — cancelled`,
                duration: 2000,
              });
            }}
          >
            Undo ({remaining}s)
          </ToastAction>
        ),
      });
      remaining--;
    }, 1000);

    // Execute after delay
    timerRef.current = setTimeout(async () => {
      cleanup();
      if (cancelledRef.current) return;

      toastIdRef.current = null;
      dismissThis();

      try {
        const result = await action();
        onSuccess?.(result);
      } catch (err: any) {
        onError?.(err);
      }
    }, delayMs);
  }, [action, message, description, delayMs, onSuccess, onError, onUndo, showToast, cleanup]);

  /** Cancel the pending action programmatically (e.g. from outside the toast) */
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    cleanup();
    if (toastIdRef.current) {
      dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, [cleanup, dismiss]);

  return { trigger, cancel };
}
