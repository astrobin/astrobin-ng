import { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";
import { ReviewImageInterface } from "@features/iotd/types/review-image.interface";

export type PromotionImageInterface = SubmissionImageInterface | ReviewImageInterface;
