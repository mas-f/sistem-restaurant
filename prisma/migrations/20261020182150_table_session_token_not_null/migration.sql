-- Backfill token QR untuk meja yang sudah ada, sebelum kolom dibuat wajib.
-- gen_random_uuid() bawaan PostgreSQL 13+ (Supabase); cast ke TEXT agar cocok
-- dengan tipe kolom. Token yang NULL diisi; duplikat (bila ada) diacak ulang,
-- kecuali baris dengan id terkecil yang mempertahankan token lamanya.
WITH dupes AS (
    SELECT "id",
           ROW_NUMBER() OVER (PARTITION BY "sessionToken" ORDER BY "id") AS rn
    FROM "DiningTable"
    WHERE "sessionToken" IS NOT NULL
)
UPDATE "DiningTable" t
SET "sessionToken" = gen_random_uuid()::text
WHERE t."sessionToken" IS NULL
   OR EXISTS (
        SELECT 1
        FROM dupes
        WHERE dupes.id = t.id AND dupes.rn > 1
   );

-- AlterTable: sessionToken adalah identitas publik pada payload QR meja —
-- wajib terisi dan unik, supaya QR tidak bisa ditebak dan tidak ambigu.
ALTER TABLE "DiningTable" ALTER COLUMN "sessionToken" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DiningTable_sessionToken_key" ON "DiningTable"("sessionToken");
