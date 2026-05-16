"use client";

import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/component/ui/alert-dialog";
import { cn } from "@/lib/utils";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type InternalState = ConfirmOptions & {
  open: boolean;
  resolver?: (value: boolean) => void;
};

/**
 * useConfirmDialog — replaces window.confirm() with shadcn AlertDialog.
 *
 * Usage:
 *   const { confirm, dialog } = useConfirmDialog();
 *   const ok = await confirm({ title: "Delete?", description: "...", destructive: true });
 *   if (!ok) return;
 *
 * Render `{dialog}` once anywhere in the component tree.
 */
export function useConfirmDialog() {
  const [state, setState] = useState<InternalState>({ open: false, title: "" });

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...opts, open: true, resolver: resolve });
    });
  }, []);

  const resolveAndClose = (value: boolean) => {
    setState((prev) => {
      prev.resolver?.(value);
      return { ...prev, open: false, resolver: undefined };
    });
  };

  const dialog = (
    <AlertDialog
      open={state.open}
      onOpenChange={(next) => {
        if (!next) resolveAndClose(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state.title}</AlertDialogTitle>
          {state.description && (
            <AlertDialogDescription>{state.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => resolveAndClose(false)}>
            {state.cancelLabel ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => resolveAndClose(true)}
            className={cn(
              state.destructive &&
                "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            )}
          >
            {state.confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, dialog };
}
