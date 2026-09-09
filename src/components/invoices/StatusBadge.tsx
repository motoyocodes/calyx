import React from "react";
import { InvoiceStatus, INVOICE_STATUS_MAP } from "@/lib/utils";

interface StatusBadgeProps {
  status: InvoiceStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = INVOICE_STATUS_MAP[status] || INVOICE_STATUS_MAP.draft;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
    >
      <span>{config.label}</span>
    </span>
  );
}
