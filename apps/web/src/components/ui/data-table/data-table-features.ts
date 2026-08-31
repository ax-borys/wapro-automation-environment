import { ReceiptRecorded } from '@/components/widgets/receipts-data-table';
import {
   compareItems,
   RankingInfo,
   rankItem,
} from '@tanstack/match-sorter-utils';
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
   TableFeatures,
   RowData,
   SortFn,
} from '@tanstack/react-table';

export interface FuzzyFilterMeta {
   itemRank?: RankingInfo;
}

type FuzzyFeatures = TableFeatures & { filterMeta: FuzzyFilterMeta };

export const fuzzyFilter: FilterFn<FuzzyFeatures, RowData> = (
   row,
   columnId,
   value,
   addMeta,
) => {
   const itemRank = rankItem(row.getValue(columnId), value);
   addMeta?.({ itemRank });
   return itemRank.passed;
};

export const fuzzySort: SortFn<FuzzyFeatures, any> = (rowA, rowB, columnId) => {
   let dir = 0;

   if (rowA.columnFiltersMeta[columnId] && rowB.columnFiltersMeta[columnId]) {
      dir = compareItems(
         rowA.columnFiltersMeta[columnId].itemRank!,
         rowB.columnFiltersMeta[columnId].itemRank!,
      );
   }

   return dir === 0 ? sortFn_alphanumeric(rowA, rowB, columnId) : dir;
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
   sortFns: {
      alphanumeric: sortFn_alphanumeric,
      text: sortFn_text,
      fuzzy: fuzzySort,
   },
   filterMeta: metaHelper<FuzzyFilterMeta>(),
});

export type DataTableFeatures = typeof features;
