"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/component/ui/button"; 
import { toast } from "sonner"; 
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubmitReviewButtonProps {
  promptId: number;
  status: string;
  ownerId: number;
}

export default function SubmitReviewButton({
  promptId,
  status,
  ownerId,
}: SubmitReviewButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 1. Auth Check: Must be the owner of the prompt
  const isOwner = session?.user?.id === String(ownerId);
  
  // 2. State Check: Must be DRAFT or REJECTED to submit
  const canSubmit = status === "DRAFT" || status === "REJECTED";

  // Hide the button if not the owner or not in a valid state
  if (!isOwner || !canSubmit) {
    return null;
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/submit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit action");
      }

      toast.success(isAdminOrEditor ? "Prompt published successfully!" : "Review request submitted successfully!");
      window.location.reload(); 
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminOrEditor = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";

  return (
    <Button
      onClick={handleSubmit}
      disabled={isLoading}
      className={`${isAdminOrEditor ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-medium transition-colors`}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      {isAdminOrEditor ? "Publish Now" : "Submit for Review"}
    </Button>
  );
}
