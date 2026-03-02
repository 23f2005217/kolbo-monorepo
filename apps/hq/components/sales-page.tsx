"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { InfoCard } from "@/components/info-card";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableRow } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, ArrowUpRight, TrendingUp, Search, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataContainer } from "@/components/data/data-container";
import { useTransactions, useTransactionStats } from "@/hooks/use-sales";

type TransactionStatus = "completed" | "pending" | "refunded" | "failed";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  product_type: string;
  product_name: string;
  created_at: string;
}

const statusConfig: Record<TransactionStatus, { label: string; color: string }> = {
  completed: { label: "Completed", color: "bg-green-500/10 text-green-700" },
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-700" },
  refunded: { label: "Refunded", color: "bg-red-500/10 text-red-700" },
  failed: { label: "Failed", color: "bg-gray-500/10 text-gray-700" },
};

export default function SalesPage() {
  const [search, setSearch] = React.useState("");
  const { data: transactions, loading, error } = useTransactions();
  const { data: stats, loading: statsLoading } = useTransactionStats();

  const filteredData = (transactions || []).filter(
    (item: Transaction) =>
      item.user_id.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalRevenue = stats?.totalRevenue || 0;
  const totalTransactions = stats?.totalTransactions || 0;
  const avgOrderValue = stats?.avgOrderValue || 0;
  const refundCount = (transactions || []).filter((t: Transaction) => t.status === "refunded").length;
  const refundRate = totalTransactions > 0 ? ((refundCount / totalTransactions) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description="Track your revenue and transactions"
        actions={
          <Button>
            <ArrowUpRight className="h-4 w-4 mr-2" />
            View Full Report
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          title="Total Revenue"
          value={statsLoading ? "..." : formatCurrency(totalRevenue)}
          subtitle="lifetime"
          icon={DollarSign}
        />
        <InfoCard
          title="Transactions"
          value={statsLoading ? "..." : totalTransactions.toLocaleString()}
          subtitle="total"
          icon={CreditCard}
        />
        <InfoCard
          title="Avg. Order Value"
          value={statsLoading ? "..." : formatCurrency(avgOrderValue)}
          subtitle="per transaction"
        />
        <InfoCard
          title="Refund Rate"
          value={statsLoading ? "..." : `${refundRate}%`}
          subtitle="of transactions"
          trend={{ value: Number(refundRate), label: "refunds", positive: false }}
        />
      </div>

      <Card className="border-border/60 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Completed</DropdownMenuItem>
                  <DropdownMenuItem>Pending</DropdownMenuItem>
                  <DropdownMenuItem>Refunded</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataContainer
            loading={loading}
            error={error}
            empty={!filteredData.length}
            emptyMessage="No transactions found."
          >
            <DataTable
              columns={["Transaction ID", "Customer", "Product", "Amount", "Status", "Date"]}
            >
              {filteredData.map((item: Transaction) => (
                <DataTableRow key={item.id}>
                  <DataTableCell className="font-medium">{item.id}</DataTableCell>
                  <DataTableCell>{item.user_id}</DataTableCell>
                  <DataTableCell>{item.product_name || item.product_type}</DataTableCell>
                  <DataTableCell className="font-semibold">{formatCurrency(item.amount)}</DataTableCell>
                  <DataTableCell>
                    <Badge className={statusConfig[item.status]?.color || statusConfig.completed.color}>
                      {statusConfig[item.status]?.label || item.status}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell className="text-muted-foreground">{formatDate(item.created_at)}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          </DataContainer>
        </CardContent>
      </Card>
    </div>
  );
}
