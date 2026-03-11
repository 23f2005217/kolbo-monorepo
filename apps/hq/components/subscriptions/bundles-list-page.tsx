"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Subsite {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number | null;
}

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  bundleSubsites: { subsite: Subsite }[];
}

export default function BundlesListPage() {
  const router = useRouter();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBundles = async () => {
    try {
      const res = await fetch("/api/bundles");
      if (res.ok) {
        const data = await res.json();
        setBundles(data);
      }
    } catch (err) {
      console.error("[BundlesListPage] Error fetching bundles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return bundles;
    const q = search.toLowerCase();
    return bundles.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.bundleSubsites.some((bs) => bs.subsite.name.toLowerCase().includes(q))
    );
  }, [bundles, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/bundles/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setBundles((prev) => prev.filter((b) => b.id !== deleteId));
      }
    } catch (err) {
      console.error("[BundlesListPage] Error deleting bundle:", err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatPrice = (cents: number | null) => {
    if (cents === null || cents === undefined) return "-";
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="groups">
        <TabsList>
          <TabsTrigger value="plans" onClick={() => router.push("/subscriptions/plans")}>
            Plans
          </TabsTrigger>
          <TabsTrigger value="groups" onClick={() => router.push("/subscriptions/bundles")}>
            Groups
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Channel Bundles</h1>
        <Button onClick={() => router.push("/subscriptions/bundles/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New bundle
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bundles..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Channels
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bundle Price
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Original
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Discount
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading bundles...
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {search ? "No bundles match your search" : "No bundles yet"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((bundle) => (
                <TableRow key={bundle.id} className="cursor-pointer" onClick={() => router.push(`/subscriptions/bundles/${bundle.id}`)}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{bundle.name}</span>
                      {bundle.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{bundle.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {bundle.bundleSubsites.map((bs) => (
                        <Badge key={bs.subsite.id} variant="outline" className="text-xs">
                          {bs.subsite.name}
                        </Badge>
                      ))}
                      {bundle.bundleSubsites.length === 0 && (
                        <span className="text-muted-foreground text-xs">No channels</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={bundle.isActive ? "default" : "secondary"} className={bundle.isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                      {bundle.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(bundle.price)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatPrice(bundle.originalPrice)}</TableCell>
                  <TableCell>
                    {bundle.discountPercent ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        {bundle.discountPercent}% off
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/subscriptions/bundles/${bundle.id}`); }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(bundle.id); }}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bundle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this bundle. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
