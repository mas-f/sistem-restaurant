-- Resep/BOM: setiap produk dapat memakai banyak bahan baku.
-- Pemakaian nyata tetap dicatat lewat StockMovement saat pesanan dibuat.
CREATE TABLE "RecipeItem" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipeItem_productId_ingredientId_key" ON "RecipeItem"("productId", "ingredientId");

-- CreateIndex
CREATE INDEX "RecipeItem_ingredientId_idx" ON "RecipeItem"("ingredientId");

-- AddForeignKey
ALTER TABLE "RecipeItem" ADD CONSTRAINT "RecipeItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeItem" ADD CONSTRAINT "RecipeItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
