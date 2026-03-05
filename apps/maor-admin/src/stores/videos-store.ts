import { create } from 'zustand';

export type SortOption = "newest" | "oldest" | "title";
export type StatusFilter = "all" | "published" | "draft" | "scheduled";

interface VideosState {
  videos: any[];
  total: number;
  loading: boolean;
  selectedVideos: Set<string>;
  searchQuery: string;
  statusFilter: StatusFilter;
  sortBy: SortOption;
  currentPage: number;
  pageSize: number;
  setVideos: (videos: any[]) => void;
  setTotal: (total: number) => void;
  setLoading: (loading: boolean) => void;
  setSelectedVideos: (videos: Set<string>) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setSortBy: (sort: SortOption) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  toggleSelectVideo: (id: string) => void;
  toggleSelectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useVideosStore = create<VideosState>((set) => ({
  videos: [],
  total: 0,
  loading: true,
  selectedVideos: new Set(),
  searchQuery: "",
  statusFilter: "all",
  sortBy: "newest",
  currentPage: 1,
  pageSize: 10,
  setVideos: (videos) => set({ videos }),
  setTotal: (total) => set({ total }),
  setLoading: (loading) => set({ loading }),
  setSelectedVideos: (selectedVideos) => set({ selectedVideos }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSortBy: (sortBy) => set({ sortBy }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setPageSize: (pageSize) => set({ pageSize, currentPage: 1 }),
  toggleSelectVideo: (id) => set((state) => {
    const newSelected = new Set(state.selectedVideos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    return { selectedVideos: newSelected };
  }),
  toggleSelectAll: (ids) => set((state) => {
    const allSelected = ids.every(id => state.selectedVideos.has(id));
    return {
      selectedVideos: allSelected ? new Set() : new Set(ids)
    };
  }),
  clearSelection: () => set({ selectedVideos: new Set() }),
}));
