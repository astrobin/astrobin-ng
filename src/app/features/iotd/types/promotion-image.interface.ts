import { JudgementImageInterface } from "@features/iotd/types/judgement-image.interface";
import { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";

export type PromotionImageInterface = SubmissionImageInterface | ReviewImageInterface | JudgementImageInterface;
