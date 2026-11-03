"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setIngredientActiveAction } from "@/lib/action";

export function InventoryActiveToggle({
  ingredientId,
  isActive,
}: {
  ingredientId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await setIngredientActiveAction(ingredientId, !isActive);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const Icon = isActive ? PowerOff : Power;

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant="outline"
        onClick={toggle}
        disabled={pending}
        className="h-9 cursor-pointer rounded-full px-4 text-sm font-bold"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Icon className="size-4" aria-hidden />
        )}
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </Button>
      {error ? (
        <p className="text-xs font-medium text-status-error-fg">{error}</p>
      ) : null}
    </div>
  );
}
