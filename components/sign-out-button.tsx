import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/action";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className={cn("cursor-pointer gap-1.5", className)}
      >
        <LogOut className="size-4" aria-hidden />
        Keluar
      </Button>
    </form>
  );
}
