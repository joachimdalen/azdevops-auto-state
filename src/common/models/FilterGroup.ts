import FilterItem from './FilterItem';

export interface FilterGroup {
  name: string;
  workItemFilters?: FilterItem[];
  parentFilters?: FilterItem[];
}
