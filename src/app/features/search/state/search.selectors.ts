import { State } from "@app/store/state";
import { SearchState } from "@features/search/state/state.reducer";

export const selectSearch = (state: State): SearchState => state.search;
