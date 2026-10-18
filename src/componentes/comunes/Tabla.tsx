import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Composición HTML: admite caption, thead, tbody y tfoot sin imponer un modelo de datos.
export function Tabla({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="tabla-caja">
      <table className={cn("tabla", className)} {...props} />
    </div>
  );
}
