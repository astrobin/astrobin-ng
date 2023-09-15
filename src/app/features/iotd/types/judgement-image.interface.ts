import { BaseQueueEntryImageInterface } from "@features/iotd/types/base-queue-entry-image.interface";

export interface JudgementImageInterface extends BaseQueueEntryImageInterface {
  lastVoteTimestamp?: string;
}
