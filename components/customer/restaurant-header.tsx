"use client";

import { restaurant } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

export function RestaurantHeader({
  tableCode,
  seats,
}: {
  tableCode: string;
  seats: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <BrandLogo className="h-7 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base leading-tight font-bold">
            {restaurant.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {restaurant.tagline}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border border-status-occupied/30",
            "bg-status-occupied-bg px-3 py-1.5 text-sm font-bold text-status-occupied-fg"
          )}
        >
          <span className="tnum">Meja {tableCode}</span>
          <span className="text-xs font-medium opacity-70">
            · {seats} kursi
          </span>
        </div>
      </div>
    </header>
  );
}
