import type { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import type { TogglePropertyInterface } from "@core/interfaces/toggle-property.interface";
import { createSelector } from "@ngrx/store";

export const selectToggleProperties = createSelector(
  selectApp,
  (state: AppState): TogglePropertyInterface[] => state.toggleProperties
);

export const selectToggleProperty = (params: Partial<TogglePropertyInterface>) =>
  createSelector(selectToggleProperties, (toggleProperties: TogglePropertyInterface[]): TogglePropertyInterface => {
    const matching = toggleProperties.filter(toggleProperty => {
      let match = true;

      Object.keys(params).forEach(key => {
        if (toggleProperty[key] !== params[key]) {
          match = false;
        }
      });

      return match;
    });

    if (matching && matching.length > 0) {
      return matching[0];
    }

    return null;
  });
