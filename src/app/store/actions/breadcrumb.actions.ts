import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { BreadcrumbInterface } from "@shared/components/misc/breadcrumb/breadcrumb.interface";

export class SetBreadcrumb implements PayloadActionInterface {
  readonly type = AppActionTypes.SET_BREADCRUMB;

  constructor(public payload: { breadcrumb: BreadcrumbInterface[] }) {}
}
