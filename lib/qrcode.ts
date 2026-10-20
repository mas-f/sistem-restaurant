import QRCode from "qrcode";

// Tinta QR: slate-900 di atas putih — kontras tinggi agar andal dipindai
// kamera HP dalam pencahayaan ruangan maupun teras.
const QR_COLOR = { dark: "#0f172a", light: "#ffffff" };

/**
 * URL absolut pembuka menu untuk satu meja — isi payload QR yang dicetak.
 * Selalu dibangun dari NEXT_PUBLIC_APP_URL supaya konsisten antara preview
 * admin, tombol salin, dan hasil pindai kamera.
 */
export function tableQrUrl(sessionToken: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_APP_URL belum diatur di .env");
  }
  return `${base.replace(/\/+$/, "")}/order/table/${encodeURIComponent(sessionToken)}`;
}

/**
 * Render QR sebagai SVG murni (tanpa canvas/sharp) — tajam di segala ukuran
 * cetak. margin 2 memberi quiet zone agar kamera mudah mengunci.
 */
export async function qrSvg(value: string): Promise<string> {
  return QRCode.toString(value, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "M",
    color: QR_COLOR,
  });
}
