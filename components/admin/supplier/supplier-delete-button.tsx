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
import { deleteSupplierAction } from "@/lib/action";

export function SupplierDeleteButton({
  supplierId,
  supplierName,
  ingredientCount,
}: {
  supplierId: string;
  supplierName: string;
  ingredientCount: number;
}) {
  const [state, formAction, pending] = useActionState(
    deleteSupplierAction,
    {}
  );
  const blocked = ingredientCount > 0;

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Hapus supplier ${supplierName}`}
        title={`Hapus supplier ${supplierName}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Trash2 className="size-4" aria-hidden />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading font-bold">
            Hapus “{supplierName}”?
          </DialogTitle>
          <DialogDescription>
            {blocked
              ? `Supplier ini masih terhubung ke ${ingredientCount} bahan. Pindahkan bahannya ke supplier lain terlebih dahulu.`
              : "Supplier akan dihapus permanen. Bahan yang tidak lagi punya supplier tetap tersimpan."}
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
          <input type="hidden" name="id" value={supplierId} />
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="h-10 cursor-pointer rounded-full px-4 text-sm font-bold"
                />
              }
            >
              {blocked ? "Tutup" : "Batal"}
            </DialogClose>
            {blocked ? null : (
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
