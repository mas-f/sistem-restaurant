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
import { deleteProductAction } from "@/lib/action";

/**
 * Tombol hapus per baris tabel menu — meniru pola "Hapus Kategori":
 * dialog konfirmasi destruktif dengan error dari action di dalam dialog.
 * Saat sukses, baris hilang dari daftar → komponen unmount → dialog tertutup
 * dengan sendirinya (tanpa useEffect).
 */
export const ProductDeleteButton = ({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) => {
  const [state, formAction, pending] = useActionState(deleteProductAction, {});

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Hapus ${productName}`}
        title={`Hapus ${productName}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Trash2 className="size-4" aria-hidden />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading font-bold">
            Hapus “{productName}”?
          </DialogTitle>
          <DialogDescription>
            Produk akan dihapus permanen dari menu. Gambar produk juga ikut
            dihapus dari penyimpanan. Tindakan ini tidak bisa dibatalkan.
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
          <input type="hidden" name="id" value={productId} />
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="h-10 rounded-full px-4 text-sm font-bold cursor-pointer"
                />
              }
            >
              Batal
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending}
              className="h-10 rounded-full px-4 text-sm font-bold cursor-pointer"
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
