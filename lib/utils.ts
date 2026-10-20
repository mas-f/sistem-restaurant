export { cn } from "cn";

/** Format angka sebagai Rupiah tanpa spasi — kembar format di lib/mock-data.ts. */
export function rupiah(n: number): string {
  return "Rp" + n.toLocaleString("id-ID");
}
