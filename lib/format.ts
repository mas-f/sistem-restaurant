/**
 * Formatter mata uang tunggal untuk seluruh UI. Dipisahkan dari mock-data
 * supaya layar yang sudah memakai database tidak perlu mengimpor data mock.
 */
export function rupiah(n: number): string {
  return "Rp" + n.toLocaleString("id-ID");
}
