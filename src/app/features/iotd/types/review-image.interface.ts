import { BaseQueueEntryImageInterface } from "@features/iotd/types/base-queue-entry-image.interface";

export interface ReviewImageInterface extends BaseQueueEntryImageInterface {
  lastSubmissionTimestamp?: string;
}
