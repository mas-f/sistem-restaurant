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
import { deleteTableAction } from "@/lib/action";

/**
 * Tombol hapus pada kartu meja — meniru pola "Hapus Produk": dialog
 * konfirmasi destruktif dengan error dari action di dalam dialog.
 * Saat sukses, kartu hilang dari daftar → komponen unmount → dialog
 * tertutup dengan sendirinya (tanpa useEffect).
 */
export const TableDeleteButton = ({
  tableId,
  tableCode,
}: {
  tableId: string;
  tableCode: string;
}) => {
  const [state, formAction, pending] = useActionState(deleteTableAction, {});

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Hapus meja ${tableCode}`}
        title={`Hapus meja ${tableCode}`}
        className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Trash2 className="size-3.5" aria-hidden />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading font-bold">
            Hapus “{tableCode}”?
          </DialogTitle>
          <DialogDescription>
            Meja akan dihapus permanen dari daftar. Tindakan ini tidak bisa
            dibatalkan.
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
          <input type="hidden" name="id" value={tableId} />
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="h-10 cursor-pointer rounded-full px-4 text-sm font-bold"
                />
              }
            >
              Batal
            </DialogClose>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
