"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/component/ui/button";

export function HeaderActions() {
  return (
    <Button
      variant="ghost"
      size="icon"
      title="Sign out"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 ease-in-out hover:scale-110 active:scale-95"
    >
      <LogOut className="h-4 w-4" strokeWidth={3} />
    </Button>
  );
}
