import { ImageInterface } from "@shared/interfaces/image.interface";
import { IotdActions, IotdActionTypes } from "./iotd.actions";

export const iotdFeatureKey = "iotd";

export interface IotdState {
  submissionQueue: ImageInterface[] | null;
}

export const initialIotdState: IotdState = {
  submissionQueue: null
};

export function reducer(state = initialIotdState, action: IotdActions): IotdState {
  switch (action.type) {
    case IotdActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS:
      return {
        submissionQueue: action.payload
      };

    default:
      return state;
  }
}
