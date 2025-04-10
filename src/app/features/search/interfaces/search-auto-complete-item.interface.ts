import type { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import type { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";

export interface SearchAutoCompleteItem {
  type: SearchAutoCompleteType;
  label: string;
  aliases?: string[];
  value?: any;
  minimumSubscription?: PayableProductInterface;
}
