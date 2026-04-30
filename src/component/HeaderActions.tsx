"use client";

import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/component/ui/button";

export function HeaderActions() {

  const { data: session } = useSession();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      title="ออกจากระบบ" 
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
