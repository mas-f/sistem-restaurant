-- Pembayaran hanya mendukung Tunai (cash) dan QRIS (qris).
-- Metode non-tunai lama dinormalisasi ke QRIS agar riwayat tidak hilang.
UPDATE "Payment"
SET "method" = 'qris'
WHERE "method" IN ('debit', 'credit', 'ewallet');

ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'qris');
ALTER TABLE "Payment"
  ALTER COLUMN "method" TYPE "PaymentMethod"
  USING ("method"::text::"PaymentMethod");
DROP TYPE "PaymentMethod_old";
