import { InjectionToken, Type } from "@angular/core";
import { SearchFilterComponentInterface } from "@features/search/interfaces/search-filter-component.interface";

export const SEARCH_FILTERS_TOKEN = new InjectionToken<Type<SearchFilterComponentInterface>[]>("SEARCH_FILTERS");
export const AUTO_COMPLETE_ONLY_FILTERS_TOKEN = new InjectionToken<Type<SearchFilterComponentInterface>[]>("AUTO_COMPLETE_ONLY_FILTERS");
