import { ImageInterface } from "@shared/interfaces/image.interface";

export interface JudgementImageInterface extends ImageInterface {
  lastVoteTimestamp?: string;
}
