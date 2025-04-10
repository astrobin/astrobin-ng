import { Type, InjectionToken } from "@angular/core";
import { SearchFilterComponentInterface } from "@core/interfaces/search-filter-component.interface";

export const SEARCH_FILTERS_TOKEN = new InjectionToken<Type<SearchFilterComponentInterface>[]>("SEARCH_FILTERS_TOKEN");

export const AUTO_COMPLETE_ONLY_FILTERS_TOKEN = new InjectionToken<Type<SearchFilterComponentInterface>[]>(
  "AUTO_COMPLETE_ONLY_FILTERS_TOKEN"
);
