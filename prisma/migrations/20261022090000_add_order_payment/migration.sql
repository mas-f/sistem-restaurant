-- Pembayaran kini dapat mencakup sebagian order dalam satu sesi meja.
-- Setiap order hanya boleh terhubung ke satu pembayaran.
ALTER TABLE "Order" ADD COLUMN "paymentId" TEXT;

CREATE INDEX "Order_paymentId_idx" ON "Order"("paymentId");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_paymentId_fkey"
FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill pembayaran lama yang masih level sesi. Hanya sesi dengan tepat
-- satu pembayaran yang aman dipetakan otomatis; order yang belum dibayar
-- (termasuk sesi terbuka) tetap NULL.
WITH single_payment AS (
  SELECT "sessionId", MIN("id") AS "paymentId"
  FROM "Payment"
  GROUP BY "sessionId"
  HAVING COUNT(*) = 1
)
UPDATE "Order" AS o
SET "paymentId" = sp."paymentId"
FROM single_payment AS sp
WHERE o."sessionId" = sp."sessionId"
  AND o."status" <> 'cancelled'
  AND o."paymentId" IS NULL;
