import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { GetGroupsParamsInterface } from "@core/services/api/classic/groups/group-api.service";
import { GroupInterface } from "@core/interfaces/group.interface";

export class LoadGroups implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_GROUPS;

  constructor(public payload: {params: GetGroupsParamsInterface}) {
  }
}

export class LoadGroupsSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_GROUPS_SUCCESS;

  constructor(public payload: {
    params: GetGroupsParamsInterface,
    groups: GroupInterface[]
  }) {
  }
}

export class LoadGroupsFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_GROUPS_FAILURE;

  constructor(public payload: {
    params: GetGroupsParamsInterface,
    error: any
  }) {
  }
}
