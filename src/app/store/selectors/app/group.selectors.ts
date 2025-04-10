import { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { GroupInterface } from "@core/interfaces/group.interface";
import { GetGroupsParamsInterface } from "@core/services/api/classic/groups/group-api.service";
import { createSelector } from "@ngrx/store";

export const selectGroups = createSelector(
  selectApp,
  (state: AppState) => state.groups // Assuming groups are stored in AppState
);

export const selectGroupsByParams = (params: GetGroupsParamsInterface) =>
  createSelector(selectGroups, (groups: GroupInterface[]) => {
    if (!groups) {
      return null;
    }

    if (params.members !== undefined) {
      // Filter groups by the member id
      return groups.filter(group => group.members.includes(params.members));
    }

    if (params.ids !== undefined && params.ids.length > 0) {
      // Filter groups by the ids
      return groups.filter(group => params.ids.includes(group.id));
    }

    // Return all groups if no filter applied
    return groups;
  });
