-- Hapus service charge & pajak. Total order kini sama dengan subtotal.
UPDATE "Order" SET "total" = "subtotal";

ALTER TABLE "Order" DROP COLUMN "serviceCharge", DROP COLUMN "tax";
