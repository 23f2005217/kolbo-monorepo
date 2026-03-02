import { create } from 'zustand';

export interface Author {
  id: string;
  name: string;
  email: string;
  bio?: string;
  imageUrl?: string;
  payoutEmail?: string;
  taxInfo?: Record<string, any>;
  totalStreams: number;
  totalRevenue: number;
  subscriptionSplit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RevShareAgreement {
  id: string;
  artistId: string;
  agreementType: string;
  durationMonths: number;
  revenueSharePercent: number;
  listingFee: number;
  contractUrl?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorFormData {
  name: string;
  email: string;
  bio?: string;
  imageUrl?: string;
  payoutEmail?: string;
  taxInfo?: Record<string, any>;
  subscriptionSplit?: number;
  isActive?: boolean;
}

export interface RevShareAgreementFormData {
  artistId: string;
  agreementType?: string;
  durationMonths?: number;
  revenueSharePercent?: number;
  listingFee?: number;
  contractUrl?: string;
  isActive?: boolean;
  expiresAt?: string;
}

interface AuthorsState {
  authors: Author[];
  agreements: RevShareAgreement[];
  loading: boolean;
  error: string | null;
  editingAuthor: Author | null;
  editingAgreement: RevShareAgreement | null;
  selectedAuthors: Set<string>;
  
  // Actions
  setAuthors: (authors: Author[]) => void;
  setAgreements: (agreements: RevShareAgreement[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEditingAuthor: (author: Author | null) => void;
  setEditingAgreement: (agreement: RevShareAgreement | null) => void;
  setSelectedAuthors: (authors: Set<string>) => void;
  toggleSelectAuthor: (id: string) => void;
  clearSelection: () => void;
  
  // Computed
  getAuthorById: (id: string) => Author | undefined;
  getAgreementsByAuthorId: (authorId: string) => RevShareAgreement[];
}

export const useAuthorsStore = create<AuthorsState>((set, get) => ({
  authors: [],
  agreements: [],
  loading: true,
  error: null,
  editingAuthor: null,
  editingAgreement: null,
  selectedAuthors: new Set(),
  
  setAuthors: (authors) => set({ authors }),
  setAgreements: (agreements) => set({ agreements }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setEditingAuthor: (editingAuthor) => set({ editingAuthor }),
  setEditingAgreement: (editingAgreement) => set({ editingAgreement }),
  setSelectedAuthors: (selectedAuthors) => set({ selectedAuthors }),
  
  toggleSelectAuthor: (id) => set((state) => {
    const newSelected = new Set(state.selectedAuthors);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    return { selectedAuthors: newSelected };
  }),
  
  clearSelection: () => set({ selectedAuthors: new Set() }),
  
  getAuthorById: (id) => {
    const { authors } = get();
    return authors.find(a => a.id === id);
  },
  
  getAgreementsByAuthorId: (authorId) => {
    const { agreements } = get();
    return agreements.filter(a => a.artistId === authorId);
  },
}));
