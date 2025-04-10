import type { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import type { TelescopeInterface } from "@core/interfaces/telescope.interface";
import { createSelector } from "@ngrx/store";

export const selectTelescopes = createSelector(selectApp, (state: AppState): TelescopeInterface[] => state.telescopes);

export const selectTelescope = createSelector(
  selectTelescopes,
  (telescopes: TelescopeInterface[], pk: number): TelescopeInterface => {
    const matching = telescopes.filter(telescope => telescope.pk === pk);
    return matching.length > 0 ? matching[0] : null;
  }
);
