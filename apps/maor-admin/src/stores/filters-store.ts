import { create } from 'zustand';

export interface FilterValue {
  id: string;
  filterId: string;
  label: string;
  value: string;
  position: number;
  isActive: boolean;
  createdAt: string;
}

export interface Filter {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  filterValues: FilterValue[];
}

export interface FilterFormData {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  position?: number;
  filterValues?: Omit<FilterValue, 'id' | 'filterId' | 'createdAt'>[];
}

export interface FilterValueFormData {
  label: string;
  value: string;
  position?: number;
  isActive?: boolean;
}

interface FiltersState {
  filters: Filter[];
  loading: boolean;
  error: string | null;
  editingFilter: Filter | null;
  editingFilterValue: FilterValue | null;
  selectedFilters: Set<string>;
  
  // Actions
  setFilters: (filters: Filter[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEditingFilter: (filter: Filter | null) => void;
  setEditingFilterValue: (filterValue: FilterValue | null) => void;
  setSelectedFilters: (filters: Set<string>) => void;
  toggleSelectFilter: (id: string) => void;
  clearSelection: () => void;
  
  // Computed
  getSortedFilters: () => Filter[];
  getFilterById: (id: string) => Filter | undefined;
}

export const useFiltersStore = create<FiltersState>((set, get) => ({
  filters: [],
  loading: true,
  error: null,
  editingFilter: null,
  editingFilterValue: null,
  selectedFilters: new Set(),
  
  setFilters: (filters) => set({ filters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setEditingFilter: (editingFilter) => set({ editingFilter }),
  setEditingFilterValue: (editingFilterValue) => set({ editingFilterValue }),
  setSelectedFilters: (selectedFilters) => set({ selectedFilters }),
  
  toggleSelectFilter: (id) => set((state) => {
    const newSelected = new Set(state.selectedFilters);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    return { selectedFilters: newSelected };
  }),
  
  clearSelection: () => set({ selectedFilters: new Set() }),
  
  getSortedFilters: () => {
    const { filters } = get();
    return [...filters].sort((a, b) => (a.position || 0) - (b.position || 0));
  },
  
  getFilterById: (id) => {
    const { filters } = get();
    return filters.find(f => f.id === id);
  },
}));
