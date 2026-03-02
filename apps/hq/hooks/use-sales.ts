"use client";

import { useDataFetch } from "./use-data-fetch";

// ==================== TRANSACTION/SALES HOOKS ====================
export function useTransactions() {
  return useDataFetch<any[]>({ url: "/api/transactions" });
}

export function useTransaction(id?: string) {
  return useDataFetch<any>({ url: id ? `/api/transactions/${id}` : "" });
}

export function useTransactionStats() {
  return useDataFetch<any>({ url: "/api/transactions/stats" });
}
