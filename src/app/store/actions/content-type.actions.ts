// tslint:disable:max-classes-per-file

import { AppActionTypes } from "@app/store/actions/app.actions";
import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";

export class LoadContentType implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_CONTENT_TYPE;

  constructor(public payload: { appLabel: string; model: string }) {}
}

export class LoadContentTypeSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_CONTENT_TYPE_SUCCESS;

  constructor(public payload: ContentTypeInterface) {}
}
