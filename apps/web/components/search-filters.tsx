'use client';

import { Filter, X, Tv } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFiltersProps {
  selectedChannel: string;
  selectedCategory: string;
  selectedType: string;
  selectedYear: string;
  selectedSort: string;
  onChannelChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearAll: () => void;
}

const CHANNELS = [
  'All Channels',
  'Toveedo',
  'Chofetz Chaim',
  'Torah Live',
  'Chabad.org/kids',
  'Malkali',
  'Meir Kids',
  'SHAZAK',
  'Hidabroot',
  'Shezoli',
  'Bais Rivkah',
];

const CATEGORIES = [
  'All Categories',
  'Entertainment',
  'Educational',
  'Documentary',
  'Kids',
];

const TYPES = ['All Types', 'Movie', 'Short', 'Documentary', 'Lecture', 'Series'];

const YEARS = [
  'All Years',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018',
];

const SORT_OPTIONS = [
  'Relevance',
  'Newest First',
  'Oldest First',
  'A-Z',
  'Z-A',
  'Most Viewed',
];

export function SearchFilters({
  selectedChannel,
  selectedCategory,
  selectedType,
  selectedYear,
  selectedSort,
  onChannelChange,
  onCategoryChange,
  onTypeChange,
  onYearChange,
  onSortChange,
  onClearAll,
}: SearchFiltersProps) {
  const hasActiveFilters =
    selectedChannel !== 'All Channels' ||
    selectedCategory !== 'All Categories' ||
    selectedType !== 'All Types' ||
    selectedYear !== 'All Years' ||
    selectedSort !== 'Relevance';

  return (
    <div className="w-full rounded-lg border border-white/10 bg-[#1a1b24] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="size-5 text-white/70" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
          >
            <X className="size-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select value={selectedChannel} onValueChange={onChannelChange}>
          <SelectTrigger
            className={`bg-[#0a0b14] text-white ${
              selectedChannel !== 'All Channels'
                ? 'border-[#4A90FF]'
                : 'border-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {selectedChannel !== 'All Channels' && (
                <Tv className="size-4 text-[#4A90FF]" />
              )}
              <SelectValue placeholder="Channel" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-[#1a1b24] text-white">
            {CHANNELS.map((channel) => (
              <SelectItem key={channel} value={channel}>
                {channel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger
            className={`bg-[#0a0b14] text-white ${
              selectedCategory !== 'All Categories'
                ? 'border-[#4A90FF]'
                : 'border-white/20'
            }`}
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1b24] text-white">
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger
            className={`bg-[#0a0b14] text-white ${
              selectedType !== 'All Types'
                ? 'border-[#4A90FF]'
                : 'border-white/20'
            }`}
          >
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1b24] text-white">
            {TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger
            className={`bg-[#0a0b14] text-white ${
              selectedYear !== 'All Years'
                ? 'border-[#4A90FF]'
                : 'border-white/20'
            }`}
          >
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1b24] text-white">
            {YEARS.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSort} onValueChange={onSortChange}>
          <SelectTrigger
            className={`bg-[#0a0b14] text-white ${
              selectedSort !== 'Relevance'
                ? 'border-[#4A90FF]'
                : 'border-white/20'
            }`}
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1b24] text-white">
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
