$content = @"
"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import {
  Boxes, Calendar, ChevronLeft, ChevronRight, Download,
  FileText, Search, ShoppingCart, TrendingUp, Users, X,
} from "lucide-react";

import type { DemoOrderReportItem } from "@/types/demo-orders";
import { cn } from "@/utils/cn";

type SortField = "date" | "qty" | "unitPrice" | "lineTotal" | "remainingStock";
type SortDir = "asc" | "desc";
"@
Set-Content -Path src/screens/AdminSalesReport.tsx -Value $content -Encoding UTF8
Write-Host "Done"
