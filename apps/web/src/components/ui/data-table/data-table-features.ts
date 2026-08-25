import { ReceiptRecorded } from '@/components/features/receipts-data-table';
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import {
   tableFeatures,
   columnFilteringFeature,
   columnVisibilityFeature,
   rowPaginationFeature,
   rowSelectionFeature,
   rowSortingFeature,
   createFilteredRowModel,
   createPaginatedRowModel,
   createSortedRowModel,
   filterFn_includesString,
   sortFn_alphanumeric,
   sortFn_text,
   FilterFn,
   metaHelper,
   globalFilteringFeature,
   columnSizingFeature,
} from '@tanstack/react-table';

export interface FuzzyFilterMeta {
   itemRank?: RankingInfo;
}
export const fuzzyFilter: FilterFn<any, any> = (
   row,
   columnId,
   value,
   addMeta,
) => {
   const itemRank = rankItem(row.getValue(columnId), value);
   addMeta?.({ itemRank });
   return itemRank.passed;
};

export const features = tableFeatures({
   columnSizingFeature,
   columnFilteringFeature,
   columnVisibilityFeature,
   rowPaginationFeature,
   rowSelectionFeature,
   rowSortingFeature,
   globalFilteringFeature,
   filteredRowModel: createFilteredRowModel(),
   paginatedRowModel: createPaginatedRowModel(),
   sortedRowModel: createSortedRowModel(),
   filterFns: { includesString: filterFn_includesString, fuzzy: fuzzyFilter },
   sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
   filterMeta: metaHelper<FuzzyFilterMeta>(),
});

export type DataTableFeatures = typeof features;
