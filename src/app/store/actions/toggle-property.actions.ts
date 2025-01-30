/* eslint-disable max-classes-per-file */

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { TogglePropertyInterface } from "@core/interfaces/toggle-property.interface";

export class CreateToggleProperty implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_TOGGLE_PROPERTY;

  constructor(public payload: { toggleProperty: Partial<TogglePropertyInterface> }) {
  }
}

export class CreateTogglePropertySuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS;

  constructor(public payload: { toggleProperty: TogglePropertyInterface }) {
  }
}

export class CreateTogglePropertyFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_TOGGLE_PROPERTY_FAILURE;

  constructor(public payload: { toggleProperty: Partial<TogglePropertyInterface> }) {
  }
}

export class DeleteToggleProperty implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_TOGGLE_PROPERTY;

  constructor(public payload: { toggleProperty: Partial<TogglePropertyInterface> }) {
  }
}

export class DeleteTogglePropertySuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS;

  constructor(public payload: { toggleProperty: Partial<TogglePropertyInterface> }) {
  }
}

export class DeleteTogglePropertyFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_TOGGLE_PROPERTY_FAILURE;

  constructor(public payload: { toggleProperty: Partial<TogglePropertyInterface> }) {
  }
}

export class LoadToggleProperty implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_TOGGLE_PROPERTY;

  constructor(public payload: { toggleProperty: Partial<TogglePropertyInterface> }) {
  }
}

export class LoadTogglePropertySuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_TOGGLE_PROPERTY_SUCCESS;

  constructor(public payload: { toggleProperty: TogglePropertyInterface }) {
  }
}

export class LoadTogglePropertyFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_TOGGLE_PROPERTY_FAILURE;

  constructor(public payload: { toggleProperty: Partial<TogglePropertyInterface> }) {
  }
}

export class LoadToggleProperties implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_TOGGLE_PROPERTIES;

  constructor(public payload: { toggleProperties: Partial<TogglePropertyInterface>[] }) {
  }
}

export class LoadTogglePropertiesSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_TOGGLE_PROPERTIES_SUCCESS;

  constructor(public payload: { toggleProperties: TogglePropertyInterface[] }) {
  }
}

export class LoadTogglePropertiesFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_TOGGLE_PROPERTIES_FAILURE;

  constructor(public payload: { toggleProperties: Partial<TogglePropertyInterface>[] }) {
  }
}
