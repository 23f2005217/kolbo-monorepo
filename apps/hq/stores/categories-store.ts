import { create } from 'zustand';

export type CategoryType = 'video_row' | 'hero_banner' | 'large_text_block' | 'category_card_row' | 'divider';

export interface Category {
  id: string;
  type: CategoryType;
  name: string;
  description?: string;
  position: number;
  config?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  type: CategoryType;
  name: string;
  description?: string;
  position?: number;
  config?: Record<string, any>;
  isActive?: boolean;
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  editingCategory: Category | null;
  isReordering: boolean;
  selectedCategories: Set<string>;
  
  // Actions
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEditingCategory: (category: Category | null) => void;
  setIsReordering: (isReordering: boolean) => void;
  setSelectedCategories: (categories: Set<string>) => void;
  toggleSelectCategory: (id: string) => void;
  clearSelection: () => void;
  
  // Computed
  getSortedCategories: () => Category[];
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  loading: true,
  error: null,
  editingCategory: null,
  isReordering: false,
  selectedCategories: new Set(),
  
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setEditingCategory: (editingCategory) => set({ editingCategory }),
  setIsReordering: (isReordering) => set({ isReordering }),
  setSelectedCategories: (selectedCategories) => set({ selectedCategories }),
  
  toggleSelectCategory: (id) => set((state) => {
    const newSelected = new Set(state.selectedCategories);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    return { selectedCategories: newSelected };
  }),
  
  clearSelection: () => set({ selectedCategories: new Set() }),
  
  getSortedCategories: () => {
    const { categories } = get();
    return [...categories].sort((a, b) => (a.position || 0) - (b.position || 0));
  },
}));
