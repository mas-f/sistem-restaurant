import Image from "next/image";
import logo from "@/public/logo.png";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative block aspect-[185/51] overflow-hidden",
        className
      )}
    >
      <Image
        src={logo}
        alt="RestoFlow"
        fill
        sizes="160px"
        className="object-cover"
      />
    </span>
  );
}
