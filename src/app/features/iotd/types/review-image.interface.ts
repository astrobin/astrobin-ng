import { ImageInterface } from "@shared/interfaces/image.interface";

export interface ReviewImageInterface extends ImageInterface {
  lastSubmissionTimestamp?: string;
}
