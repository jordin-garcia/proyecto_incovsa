"use client";

import type { ComponentProps } from "react";
import { Tabs as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Tabs = Primitive.Root;
export const TabsContent = Primitive.Content;
export function TabsList({ className, ...props }: ComponentProps<typeof Primitive.List>) {
  return <Primitive.List className={cn("pestanas", className)} {...props} />;
}
export const TabsTrigger = Primitive.Trigger;
