import { AppActionTypes } from "@app/store/actions/app.actions";
import type { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import type { BreadcrumbInterface } from "@shared/components/misc/breadcrumb/breadcrumb.interface";

export class SetBreadcrumb implements PayloadActionInterface {
  readonly type = AppActionTypes.SET_BREADCRUMB;

  constructor(public payload: { breadcrumb: BreadcrumbInterface[] }) {}
}
