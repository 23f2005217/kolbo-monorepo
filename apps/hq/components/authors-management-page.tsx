"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  User,
  Mail,
  DollarSign,
  FileText,
  Upload,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/utils";
import { DataContainer } from "@/components/data/data-container";
import { useAuthors, Author, useCreateAuthor, useDeleteAuthor, useUpdateAuthorGeneric, useRevShareAgreements, RevShareAgreement, useCreateRevShareAgreement, useUpdateRevShareAgreementGeneric, useDeleteRevShareAgreement } from "@/hooks/use-authors";
import { useAuthorsStore } from "@/stores/authors-store";

interface AuthorEditDialogProps {
  author: Author | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function AuthorEditDialog({ author, open, onClose, onSave }: AuthorEditDialogProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    bio: "",
    imageUrl: "",
    payoutEmail: "",
    subscriptionSplit: 0,
    isActive: true,
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (author) {
      setFormData({
        name: author.name || "",
        email: author.email || "",
        bio: author.bio || "",
        imageUrl: author.imageUrl || "",
        payoutEmail: author.payoutEmail || "",
        subscriptionSplit: author.subscriptionSplit || 0,
        isActive: author.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        bio: "",
        imageUrl: "",
        payoutEmail: "",
        subscriptionSplit: 0,
        isActive: true,
      });
    }
  }, [author, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving author:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {author ? "Edit Author" : "Add Author"}
          </DialogTitle>
          <DialogDescription>
            Configure the author profile and revenue share settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Author Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Author name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="author@example.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Author Bio</Label>
            <div className="border rounded-lg">
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Write a biography for this author..."
                rows={4}
                className="border-0 rounded-t-lg focus-visible:ring-0"
              />
              <div className="flex items-center gap-1 p-2 border-t bg-muted/50 rounded-b-lg">
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2">
                  <span className="font-bold">B</span>
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2">
                  <span className="italic">I</span>
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2">
                  <span className="underline">U</span>
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2">
                  <span className="text-xs">• List</span>
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2">
                  <span className="text-xs">1. List</span>
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2">
                  <span className="text-xs">🔗 Link</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Author Image</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              <Button type="button" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Recommended resolution: 740x740 pixels</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payoutEmail">Payout Email</Label>
              <Input
                id="payoutEmail"
                type="email"
                value={formData.payoutEmail}
                onChange={(e) => setFormData({ ...formData, payoutEmail: e.target.value })}
                placeholder="payout@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionSplit">Subscription Split (%)</Label>
              <Input
                id="subscriptionSplit"
                type="number"
                min="0"
                max="100"
                value={formData.subscriptionSplit}
                onChange={(e) => setFormData({ ...formData, subscriptionSplit: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <DialogFooter className="gap-2">
            {author && (
              <Button type="button" variant="destructive" onClick={() => onClose()}>
                Delete Author
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AgreementEditDialogProps {
  agreement: RevShareAgreement | null;
  authorId: string;
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function AgreementEditDialog({ agreement, authorId, open, onClose, onSave }: AgreementEditDialogProps) {
  const [formData, setFormData] = React.useState({
    artistId: authorId,
    agreementType: "non_exclusive",
    durationMonths: 12,
    revenueSharePercent: 50,
    listingFee: 0,
    contractUrl: "",
    isActive: true,
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (agreement) {
      setFormData({
        artistId: agreement.artistId || authorId,
        agreementType: agreement.agreementType || "non_exclusive",
        durationMonths: agreement.durationMonths || 12,
        revenueSharePercent: agreement.revenueSharePercent || 50,
        listingFee: agreement.listingFee || 0,
        contractUrl: agreement.contractUrl || "",
        isActive: agreement.isActive ?? true,
      });
    } else {
      setFormData({
        artistId: authorId,
        agreementType: "non_exclusive",
        durationMonths: 12,
        revenueSharePercent: 50,
        listingFee: 0,
        contractUrl: "",
        isActive: true,
      });
    }
  }, [agreement, authorId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving agreement:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {agreement ? "Edit Revenue Share Agreement" : "Add Revenue Share Agreement"}
          </DialogTitle>
          <DialogDescription>
            Configure the revenue share agreement terms.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agreementType">Agreement Type</Label>
            <Select
              value={formData.agreementType}
              onValueChange={(value) => setFormData({ ...formData, agreementType: value })}
            >
              <SelectTrigger id="agreementType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exclusive">Exclusive</SelectItem>
                <SelectItem value="non_exclusive">Non-Exclusive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMonths">Duration (Months)</Label>
              <Input
                id="durationMonths"
                type="number"
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) || 12 })}
                placeholder="12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenueSharePercent">Revenue Share (%)</Label>
              <Input
                id="revenueSharePercent"
                type="number"
                min="0"
                max="100"
                value={formData.revenueSharePercent}
                onChange={(e) => setFormData({ ...formData, revenueSharePercent: parseInt(e.target.value) || 50 })}
                placeholder="50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="listingFee">Listing Fee (cents)</Label>
            <Input
              id="listingFee"
              type="number"
              min="0"
              value={formData.listingFee}
              onChange={(e) => setFormData({ ...formData, listingFee: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractUrl">Contract URL</Label>
            <Input
              id="contractUrl"
              value={formData.contractUrl}
              onChange={(e) => setFormData({ ...formData, contractUrl: e.target.value })}
              placeholder="https://example.com/contract.pdf"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AuthorCardProps {
  author: Author;
  agreements: RevShareAgreement[];
  onEdit: (author: Author) => void;
  onDelete: (id: string) => void;
  onEditAgreement: (agreement: RevShareAgreement, authorId: string) => void;
  onAddAgreement: (authorId: string) => void;
  onDeleteAgreement: (id: string) => void;
}

function AuthorCard({ author, agreements, onEdit, onDelete, onEditAgreement, onAddAgreement, onDeleteAgreement }: AuthorCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const authorAgreements = agreements.filter(a => a.artistId === author.id);

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={author.imageUrl} alt={author.name} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{author.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {author.email}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {author.createdAt ? new Date(author.createdAt).toLocaleDateString() : 'N/A'}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={() => onEdit(author)}
        >
          Edit
        </Button>
      </div>
      {expanded && (
        <div className="px-4 py-3 bg-muted/30 border-t border-border/60">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Revenue Share Agreements ({authorAgreements.length})</h4>
              <Button size="sm" variant="outline" onClick={() => onAddAgreement(author.id)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Agreement
              </Button>
            </div>
            {authorAgreements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No agreements configured</p>
            ) : (
              <div className="space-y-2">
                {authorAgreements.map((agreement) => (
                  <div
                    key={agreement.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-white"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {agreement.agreementType.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm font-medium">{agreement.revenueSharePercent}% Revenue Share</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {agreement.durationMonths} months • Listing Fee: ${(agreement.listingFee / 100).toFixed(2)}
                      </div>
                    </div>
                    <Badge variant={agreement.isActive ? "default" : "secondary"} className="text-xs mr-2">
                      {agreement.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEditAgreement(agreement, author.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDeleteAgreement(agreement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthorsManagementPage() {
  const { authors, loading, error, refetch } = useAuthors();
  const { agreements, refetch: refetchAgreements } = useRevShareAgreements();
  const { createAuthor } = useCreateAuthor();
  const { deleteAuthor } = useDeleteAuthor();
  const { updateAuthor } = useUpdateAuthorGeneric();
  const { createAgreement } = useCreateRevShareAgreement();
  const { updateAgreement } = useUpdateRevShareAgreementGeneric();
  const { deleteAgreement } = useDeleteRevShareAgreement();

  const [editDialog, setEditDialog] = React.useState<{ open: boolean; author: Author | null }>({ open: false, author: null });
  const [agreementEditDialog, setAgreementEditDialog] = React.useState<{ open: boolean; agreement: RevShareAgreement | null; authorId: string }>({ open: false, agreement: null, authorId: "" });
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null; type: 'author' | 'agreement' }>({ open: false, id: null, type: 'author' });

  const handleEditAuthor = (author: Author) => {
    setEditDialog({ open: true, author });
  };

  const handleSaveAuthor = async (data: any) => {
    if (editDialog.author) {
      await updateAuthor({ id: editDialog.author.id, ...data });
    } else {
      await createAuthor(data);
    }
    refetch();
  };

  const handleDeleteClick = (id: string, type: 'author' | 'agreement') => {
    setDeleteDialog({ open: true, id, type });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.id) {
      if (deleteDialog.type === 'author') {
        await deleteAuthor(deleteDialog.id);
      } else {
        await deleteAgreement(deleteDialog.id);
      }
      setDeleteDialog({ open: false, id: null, type: 'author' });
      refetch();
      refetchAgreements();
    }
  };

  const handleEditAgreement = (agreement: RevShareAgreement, authorId: string) => {
    setAgreementEditDialog({ open: true, agreement, authorId });
  };

  const handleAddAgreement = (authorId: string) => {
    setAgreementEditDialog({ open: true, agreement: null, authorId });
  };

  const handleSaveAgreement = async (data: any) => {
    if (agreementEditDialog.agreement) {
      await updateAgreement({ id: agreementEditDialog.agreement.id, ...data });
    } else {
      await createAgreement(data);
    }
    refetchAgreements();
  };

  const itemToDelete = deleteDialog.id ? (
    deleteDialog.type === 'author'
      ? authors.find(a => a.id === deleteDialog.id)
      : agreements.find(a => a.id === deleteDialog.id)
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authors"
        description="Manage author profiles and revenue share agreements"
      />

      <Card className="border-border/60 bg-white overflow-hidden">
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle>Authors</CardTitle>
            <Button onClick={() => setEditDialog({ open: true, author: null })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Author
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Search Bar */}
          <div className="p-4 border-b border-border/60">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search authors..."
                className="pl-10"
              />
            </div>
          </div>
          
          <DataContainer
            loading={loading}
            error={error}
            empty={!authors.length}
            emptyMessage="No authors configured. Add your first author to manage content creators."
          >
            <div className="divide-y divide-border/60">
              {authors.map((author) => (
                <AuthorCard
                  key={author.id}
                  author={author}
                  agreements={agreements}
                  onEdit={handleEditAuthor}
                  onDelete={(id) => handleDeleteClick(id, 'author')}
                  onEditAgreement={handleEditAgreement}
                  onAddAgreement={handleAddAgreement}
                  onDeleteAgreement={(id) => handleDeleteClick(id, 'agreement')}
                />
              ))}
            </div>
          </DataContainer>
        </CardContent>
      </Card>

      <AuthorEditDialog
        author={editDialog.author}
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, author: null })}
        onSave={handleSaveAuthor}
      />

      <AgreementEditDialog
        agreement={agreementEditDialog.agreement}
        authorId={agreementEditDialog.authorId}
        open={agreementEditDialog.open}
        onClose={() => setAgreementEditDialog({ open: false, agreement: null, authorId: "" })}
        onSave={handleSaveAgreement}
      />

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: deleteDialog.id, type: deleteDialog.type })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteDialog.type === 'author' ? 'Author' : 'Agreement'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteDialog.type === 'author' ? 'author' : 'agreement'}? This action cannot be undone.
              {itemToDelete && (
                <span className="block mt-2 font-medium text-foreground">
                  {deleteDialog.type === 'author'
                    ? (itemToDelete as Author).name
                    : `${(itemToDelete as RevShareAgreement).revenueSharePercent}% Revenue Share`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: null, type: 'author' })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
