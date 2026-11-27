import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    agentUpgrade: "security",
    // Default Next.js: halaman dinamis tidak disimpan di client cache sama
    // sekali, jadi setiap kembali ke halaman sebelumnya server dirender ulang
    // (beberapa round trip database). 30 detik cukup untuk membuat navigasi
    // bolak-balik terasa instan; mutasi tetap memanggil router.refresh() dan
    // revalidatePath() sehingga data yang baru diubah langsung segar.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  images: {
    // Gambar produk disimpan di Supabase Storage (bucket publik), sehingga
    // next/image perlu izin host-nya. pathname dibatasi ke endpoint publik saja.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
