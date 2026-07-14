const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, '..', 'src', 'screens');

// 1. AdminSalesReport.tsx
const salesReportContent = `"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import {
  Boxes,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Search,
  ShoppingCart,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import type { DemoOrderReportItem } from "@/types/demo-orders";
import { cn } from "@/utils/cn";

type SortField = "date" | "qty" | "unitPrice" | "lineTotal" | "remainingStock";
type SortDir = "asc" | "desc";

interface OrderDetail {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  items: DemoOrderReportItem[];
  totalUnits: number;
  totalRevenue: number;
}

function formatCurrency(value: number) {
  return \`$\${value.toFixed(2)}\`;
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

function formatStockCount(value: number) {
  return value.toLocaleString();
}

function getISOWeekKey(date: Date): string {
  const year = date.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  const week = Math.ceil((dayOfYear + startOfYear.getUTCDay() + 1) / 7);
  return \`\${year}-W\${String(week).padStart(2, "0")}\`;
}

function formatWeekLabel(weekKey: string): string {
  return \`Week \${weekKey.replace("-W", " ")}\`;
}

function getMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return \`\${months[month]} \${year}\`;
}

const fieldClass =
  "w-full rounded-2xl border border-mono-200 bg-mono-50 px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900 focus:bg-white";
const cardClass = "rounded-[1.75rem] border border-mono-200 bg-white p-5 shadow-sm";

interface AdminSalesReportProps {
  initialReportItems: DemoOrderReportItem[];
  onNavigateCatalog: () => void;
}

export default function AdminSalesReport({ initialReportItems, onNavigateCatalog }: AdminSalesReportProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [qtyMin, setQtyMin] = useState("");
  const [qtyMax, setQtyMax] = useState("");
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 25;

  const filteredItems = useMemo(() => {
    let items = [...initialReportItems];
    if (dateFrom) items = items.filter((i) => i.createdAt >= dateFrom);
    if (dateTo) items = items.filter((i) => i.createdAt <= dateTo + "T23:59:59.999Z");
    if (priceMin) items = items.filter((i) => i.unitPrice >= Number(priceMin));
    if (priceMax) items = items.filter((i) => i.unitPrice <= Number(priceMax));
    if (qtyMin) items = items.filter((i) => i.quantity >= Number(qtyMin));
    if (qtyMax) items = items.filter((i) => i.quantity <= Number(qtyMax));
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (i) => \`\${i.orderNumber} \${i.customerName} \${i.customerEmail} \${i.productName} \${i.productId} \${i.category}\`.toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date": cmp = a.createdAt.localeCompare(b.createdAt); break;
        case "qty": cmp = a.quantity - b.quantity; break;
        case "unitPrice": cmp = a.unitPrice - b.unitPrice; break;
        case "lineTotal": cmp = a.lineTotal - b.lineTotal; break;
        case "remainingStock": cmp = a.remainingStock - b.remainingStock; break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return items;
  }, [initialReportItems, dateFrom, dateTo, priceMin, priceMax, qtyMin, qtyMax, query, sortField, sortDir]);

  const orderIds = useMemo(() => new Set(filteredItems.map((i) => i.orderId)), [filteredItems]);
  const totalOrders = orderIds.size;
  const totalUnits = filteredItems.reduce((s, i) => s + i.quantity, 0);
  const totalRevenue = filteredItems.reduce((s, i) => s + i.lineTotal, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const weeklySummary = useMemo(() => {
    const weeks = new Map<string, { orderIds: Set<string>; units: number; revenue: number }>();
    for (const item of filteredItems) {
      const key = getISOWeekKey(new Date(item.createdAt));
      if (!weeks.has(key)) weeks.set(key, { orderIds: new Set(), units: 0, revenue: 0 });
      const w = weeks.get(key)!;
      w.orderIds.add(item.orderId); w.units += item.quantity; w.revenue += item.lineTotal;
    }
    return Array.from(weeks.entries())
      .map(([week, data]) => ({ week, orders: data.orderIds.size, units: data.units, revenue: data.revenue }))
      .sort((a, b) => b.week.localeCompare(a.week)).slice(0, 10);
  }, [filteredItems]);

  const monthlySummary = useMemo(() => {
    const months = new Map<string, { orderIds: Set<string>; units: number; revenue: number }>();
    for (const item of filteredItems) {
      const key = getMonthKey(new Date(item.createdAt));
      if (!months.has(key)) months.set(key, { orderIds: new Set(), units: 0, revenue: 0 });
      const m = months.get(key)!;
      m.orderIds.add(item.orderId); m.units += item.quantity; m.revenue += item.lineTotal;
    }
    return Array.from(months.entries())
      .map(([month, data]) => ({ month, orders: data.orderIds.size, units: data.units, revenue: data.revenue }))
      .sort((a, b) => {
        const parse = (m: string) => { const [mon, yr] = m.split(" "); return new Date(\`\${mon} 1, \${yr}\`).getTime(); };
        return parse(b.month) - parse(a.month);
      }).slice(0, 12);
  }, [filteredItems]);

  const topProducts = useMemo(() => {
    const products = new Map<string, { name: string; category: string; units: number; revenue: number }>();
    for (const item of filteredItems) {
      if (!products.has(item.productId)) products.set(item.productId, { name: item.productName, category: item.category, units: 0, revenue: 0 });
      const p = products.get(item.productId)!;
      p.units += item.quantity; p.revenue += item.lineTotal;
    }
    return Array.from(products.entries()).map(([id, data]) => ({ id, ...data })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [filteredItems]);

  const topCustomers = useMemo(() => {
    const customers = new Map<string, { name: string; email: string; orders: Set<string>; revenue: number }>();
    for (const item of filteredItems) {
      const key = item.customerEmail;
      if (!customers.has(key)) customers.set(key, { name: item.customerName, email: item.customerEmail, orders: new Set(), revenue: 0 });
      const c = customers.get(key)!;
      c.orders.add(item.orderId); c.revenue += item.lineTotal;
    }
    return Array.from(customers.entries()).map(([email, data]) => ({ email, ...data, orderCount: data.orders.size })).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [filteredItems]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);
  const showingFrom = (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(safePage * pageSize, filteredItems.length);

  const handleRowClick = (item: DemoOrderReportItem) => {
    const orderItems = initialReportItems.filter((i) => i.orderId === item.orderId);
    setDetailOrder({
      orderId: item.orderId
