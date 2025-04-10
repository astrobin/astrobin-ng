import type { MainState } from "@app/store/state";
import type { SearchState } from "@features/search/state/state.reducer";

export const selectSearch = (state: MainState): SearchState => state.search;
