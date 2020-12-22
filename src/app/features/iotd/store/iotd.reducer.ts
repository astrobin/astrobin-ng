import { ImageInterface } from "@shared/interfaces/image.interface";
import { IotdActions, IotdActionTypes } from "./iotd.actions";

export const iotdFeatureKey = "iotd";

export interface State {
  submissionQueue: ImageInterface[] | null;
}

export const initialState: State = {
  submissionQueue: null
};

export function reducer(state = initialState, action: IotdActions): State {
  switch (action.type) {
    case IotdActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS:
      return {
        submissionQueue: action.payload
      };

    default:
      return state;
  }
}
