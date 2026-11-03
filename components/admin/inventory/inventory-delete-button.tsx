"use client";

import { useActionState } from "react";
import { CircleAlert, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteIngredientAction } from "@/lib/action";

export function InventoryDeleteButton({
  ingredientId,
  ingredientName,
  hasHistory,
}: {
  ingredientId: string;
  ingredientName: string;
  hasHistory: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    deleteIngredientAction,
    {}
  );

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Hapus bahan ${ingredientName}`}
        title={`Hapus bahan ${ingredientName}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Trash2 className="size-4" aria-hidden />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading font-bold">
            Hapus “{ingredientName}”?
          </DialogTitle>
          <DialogDescription>
            {hasHistory
              ? "Bahan ini sudah punya riwayat stok, jadi tidak bisa dihapus permanen. Nonaktifkan lewat halaman detail agar riwayat dan laporan tetap utuh."
              : "Bahan akan dihapus permanen dari daftar inventaris. Tindakan ini tidak bisa dibatalkan."}
          </DialogDescription>
        </DialogHeader>

        {state.error ? (
          <Alert variant="destructive" className="px-3 py-2.5 text-xs">
            <CircleAlert />
            <AlertDescription className="text-xs font-medium">
              {state.error}
            </AlertDescription>
          </Alert>
        ) : null}

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={ingredientId} />
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="h-10 cursor-pointer rounded-full px-4 text-sm font-bold"
                />
              }
            >
              {hasHistory ? "Tutup" : "Batal"}
            </DialogClose>
            {hasHistory ? null : (
              <Button
                type="submit"
                variant="destructive"
                disabled={pending}
                className="h-10 cursor-pointer rounded-full px-4 text-sm font-bold"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
