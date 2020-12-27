import { ImageInterface } from "@shared/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { IotdActions, IotdActionTypes } from "./iotd.actions";

export const iotdFeatureKey = "iotd";

export interface IotdState {
  submissionQueue: PaginatedApiResultInterface<ImageInterface> | null;
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
